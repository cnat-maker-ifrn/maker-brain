import io
from datetime import datetime
from django.db import models
from django.db.models import Q
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

from makerapp.models import Visit, School, Company


MONTH_NAMES_SHORT = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

MONTH_NAMES_FULL = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

DEPARTMENT_LABELS = {
    'diatinf': 'DIATINF',
    'diaren': 'DIAREN',
    'diacon': 'DIACON',
    'diacin': 'DIACIN',
    'diac': 'DIAC',
}


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and render total page count."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Footer line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(1.5 * cm, 1.2 * cm, A4[0] - 1.5 * cm, 1.2 * cm)

        footer_text = f"CNAT Maker • Sistema MakerBrain • Página {self._pageNumber} de {page_count}"
        self.drawCentredString(A4[0] / 2, 0.8 * cm, footer_text)
        self.restoreState()


class ReportService:

    @staticmethod
    def get_available_years():
        """Returns sorted list of distinct years available in visits."""
        years_query = Visit.objects.dates('scheduling_date', 'year')
        extracted = {d.year for d in years_query}
        current_year = timezone.now().year
        extracted.add(current_year)
        return sorted(list(extracted), reverse=True)

    @classmethod
    def get_report_data(cls, year=None, month=None):
        """Aggregates all metrics for reports."""
        now = timezone.now()

        # Parse year
        if year is None or year == '':
            target_year = now.year
        else:
            try:
                target_year = int(year)
            except (ValueError, TypeError):
                target_year = now.year

        # Parse month
        target_month = None
        if month not in (None, '', 'all', 'todos'):
            try:
                m = int(month)
                if 1 <= m <= 12:
                    target_month = m
            except (ValueError, TypeError):
                target_month = None

        if target_month:
            period_label = f"{MONTH_NAMES_FULL[target_month]} de {target_year}"
            period_type = 'month'
        else:
            period_label = f"Ano Completo de {target_year}"
            period_type = 'year'

        # Base filter for attended visits:
        # Accepted visits that are not closed-without-visiting, or visits explicitly marked has_visited=True
        attended_filter = (
            Q(has_visited=True) |
            (Q(acceptance_status='accepted') & ~Q(is_visit_closed=True, has_visited=False))
        )

        base_visits_qs = Visit.objects.filter(attended_filter)

        # Year filter
        year_visits_qs = base_visits_qs.filter(scheduling_date__year=target_year)

        # Filtered visits for the active period (month or year)
        if target_month:
            period_visits_qs = year_visits_qs.filter(scheduling_date__month=target_month)
        else:
            period_visits_qs = year_visits_qs

        # Helper to compute visitors for a visit
        def calc_visitors(v):
            if v.real_number_of_visitors is not null and v.real_number_of_visitors > 0:
                return v.real_number_of_visitors
            return v.forecast_number_of_visitors or 0

        null = None  # python None

        period_visits = list(period_visits_qs.select_related('school', 'company', 'requester'))

        # 1. Total visitors and visits
        total_visits = len(period_visits)
        total_visitors = sum(calc_visitors(v) for v in period_visits)

        # 2. Directorates attended
        dept_counts = {}
        dept_visitors = {}
        for v in period_visits:
            dept = v.cnat_department
            if dept:
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
                dept_visitors[dept] = dept_visitors.get(dept, 0) + calc_visitors(v)

        total_departments_attended = len(dept_counts)
        total_dept_visits = sum(dept_counts.values())

        directorates_breakdown = []
        for dept_code, label in DEPARTMENT_LABELS.items():
            count = dept_counts.get(dept_code, 0)
            if count > 0:
                pct = round((count / total_dept_visits * 100), 1) if total_dept_visits > 0 else 0
                directorates_breakdown.append({
                    'department': dept_code,
                    'name': label,
                    'visits_count': count,
                    'visitors_count': dept_visitors.get(dept_code, 0),
                    'percentage': pct,
                })
        # In case of custom departments not in standard choices
        for dept_code, count in dept_counts.items():
            if dept_code not in DEPARTMENT_LABELS:
                pct = round((count / total_dept_visits * 100), 1) if total_dept_visits > 0 else 0
                directorates_breakdown.append({
                    'department': dept_code,
                    'name': dept_code.upper(),
                    'visits_count': count,
                    'visitors_count': dept_visitors.get(dept_code, 0),
                    'percentage': pct,
                })

        # 3. Schools attended
        school_visits = [v for v in period_visits if v.school_id or v.requester_origin == 'school']
        school_map = {}
        public_visitors = 0
        private_visitors = 0
        public_visits = 0
        private_visits = 0

        for v in school_visits:
            visitors = calc_visitors(v)
            if v.school:
                s_id = v.school.id
                if s_id not in school_map:
                    school_map[s_id] = {
                        'id': s_id,
                        'name': v.school.name,
                        'school_type': v.school.school_type,
                        'school_type_display': 'Pública' if v.school.school_type == 'public' else 'Privada',
                        'city': v.school.city or '-',
                        'state': v.school.state or '-',
                        'visits_count': 0,
                        'total_visitors': 0,
                        'dates': [],
                    }
                school_map[s_id]['visits_count'] += 1
                school_map[s_id]['total_visitors'] += visitors
                date_str = v.scheduling_date.strftime('%d/%m/%Y')
                if date_str not in school_map[s_id]['dates']:
                    school_map[s_id]['dates'].append(date_str)

                if v.school.school_type == 'public':
                    public_visits += 1
                    public_visitors += visitors
                elif v.school.school_type == 'private':
                    private_visits += 1
                    private_visitors += visitors

        schools_list = sorted(list(school_map.values()), key=lambda x: x['visits_count'], reverse=True)
        total_schools_count = len(schools_list)

        public_schools_count = sum(1 for s in schools_list if s['school_type'] == 'public')
        private_schools_count = sum(1 for s in schools_list if s['school_type'] == 'private')

        total_school_visitors = public_visitors + private_visitors
        public_pct = round((public_visitors / total_school_visitors * 100), 1) if total_school_visitors > 0 else 0
        private_pct = round((private_visitors / total_school_visitors * 100), 1) if total_school_visitors > 0 else 0

        students_profile = {
            'public_schools_count': public_schools_count,
            'private_schools_count': private_schools_count,
            'public_visits_count': public_visits,
            'private_visits_count': private_visits,
            'public_visitors_count': public_visitors,
            'private_visitors_count': private_visitors,
            'total_school_visitors': total_school_visitors,
            'public_percentage': public_pct,
            'private_percentage': private_pct,
        }

        # 4. Companies attended
        company_visits = [v for v in period_visits if v.company_id or v.requester_origin == 'company']
        company_map = {}
        incubated_companies_count = 0
        non_incubated_companies_count = 0
        incubated_visits = 0
        non_incubated_visits = 0

        for v in company_visits:
            visitors = calc_visitors(v)
            if v.company:
                c_id = v.company.id
                if c_id not in company_map:
                    is_inc = bool(v.company.is_incubated)
                    company_map[c_id] = {
                        'id': c_id,
                        'name': v.company.name,
                        'cnpj': v.company.cnpj or '-',
                        'is_incubated': is_inc,
                        'is_incubated_display': 'Sim (Incubada IFRN)' if is_inc else 'Não (Externa)',
                        'visits_count': 0,
                        'total_visitors': 0,
                        'dates': [],
                    }
                company_map[c_id]['visits_count'] += 1
                company_map[c_id]['total_visitors'] += visitors
                date_str = v.scheduling_date.strftime('%d/%m/%Y')
                if date_str not in company_map[c_id]['dates']:
                    company_map[c_id]['dates'].append(date_str)

                if v.company.is_incubated:
                    incubated_visits += 1
                else:
                    non_incubated_visits += 1

        companies_list = sorted(list(company_map.values()), key=lambda x: x['visits_count'], reverse=True)
        total_companies_count = len(companies_list)
        incubated_companies_count = sum(1 for c in companies_list if c['is_incubated'])
        non_incubated_companies_count = sum(1 for c in companies_list if not c['is_incubated'])

        companies_profile = {
            'total_companies': total_companies_count,
            'incubated_companies_count': incubated_companies_count,
            'non_incubated_companies_count': non_incubated_companies_count,
            'incubated_visits_count': incubated_visits,
            'non_incubated_visits_count': non_incubated_visits,
            'list': companies_list,
        }

        # 5. Monthly school visits (across the target_year, Jan to Dec)
        year_school_visits = year_visits_qs.filter(
            Q(school__isnull=False) | Q(requester_origin='school')
        )
        monthly_school_visits = []
        for m in range(1, 13):
            m_visits = year_school_visits.filter(scheduling_date__month=m)
            m_count = m_visits.count()
            m_visitors = sum(calc_visitors(v) for v in m_visits)
            monthly_school_visits.append({
                'month': m,
                'name': MONTH_NAMES_SHORT[m - 1],
                'full_name': MONTH_NAMES_FULL[m],
                'visits_count': m_count,
                'visitors_count': m_visitors,
                'is_selected': (target_month == m),
            })

        return {
            'period': {
                'year': target_year,
                'month': target_month,
                'label': period_label,
                'type': period_type,
            },
            'available_years': cls.get_available_years(),
            'summary': {
                'total_visitors': total_visitors,
                'total_visits': total_visits,
                'total_schools': total_schools_count,
                'total_companies': total_companies_count,
                'total_directorates': total_departments_attended,
            },
            'directorates': {
                'total_attended': total_departments_attended,
                'breakdown': directorates_breakdown,
            },
            'students_profile': students_profile,
            'schools': {
                'total': total_schools_count,
                'list': schools_list,
            },
            'companies': companies_profile,
            'monthly_school_visits': monthly_school_visits,
            'generated_at': now.strftime('%d/%m/%Y às %H:%M'),
        }

    @classmethod
    def generate_pdf(cls, report_data):
        """Generates a styled PDF report in bytes using ReportLab."""
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=1.5 * cm,
            rightMargin=1.5 * cm,
            topMargin=1.5 * cm,
            bottomMargin=1.8 * cm,
        )

        styles = getSampleStyleSheet()

        # Custom palette
        primary_color = colors.HexColor("#0f5132")    # Forest Dark
        secondary_color = colors.HexColor("#198754")  # Forest Medium
        accent_color = colors.HexColor("#20c997")     # Mint / Accent
        text_dark = colors.HexColor("#1e293b")        # Slate 800
        text_muted = colors.HexColor("#64748b")       # Slate 500
        bg_light = colors.HexColor("#f8fafc")         # Slate 50
        border_color = colors.HexColor("#e2e8f0")     # Slate 200

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=primary_color,
            alignment=1, # Center
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            textColor=text_muted,
            alignment=1,
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=primary_color,
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=text_dark,
        )

        body_bold = ParagraphStyle(
            'ReportBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold',
        )

        th_style = ParagraphStyle(
            'TH',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.white,
            alignment=1,
        )

        td_style = ParagraphStyle(
            'TD',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=text_dark,
        )

        td_center = ParagraphStyle(
            'TDCenter',
            parent=td_style,
            alignment=1,
        )

        elements = []

        # Header Title Banner
        elements.append(Paragraph("CNAT MAKER • LABORATÓRIO DE FABRICAÇÃO DIGITAL", subtitle_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph("RELATÓRIO GERENCIAL DE VISITAS E ATENDIMENTOS", title_style))
        elements.append(Spacer(1, 4))

        meta_text = (
            f"<b>Período:</b> {report_data['period']['label']} &nbsp;&nbsp;|&nbsp;&nbsp; "
            f"<b>Emitido em:</b> {report_data['generated_at']}"
        )
        elements.append(Paragraph(meta_text, subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

        # --- Section 1: RESUMO GERAL DOS INDICADORES ---
        elements.append(Paragraph("1. RESUMO DOS PRINCIPAIS INDICADORES", section_heading))

        s = report_data['summary']
        summary_cards_data = [
            [
                Paragraph("<b>Total de Visitantes</b>", body_style),
                Paragraph("<b>Total de Visitas</b>", body_style),
                Paragraph("<b>Escolas Atendidas</b>", body_style),
                Paragraph("<b>Empresas Atendidas</b>", body_style),
                Paragraph("<b>Diretorias Atendidas</b>", body_style),
            ],
            [
                Paragraph(f"<font size='14' color='{primary_color}'><b>{s['total_visitors']}</b></font>", td_center),
                Paragraph(f"<font size='14' color='{primary_color}'><b>{s['total_visits']}</b></font>", td_center),
                Paragraph(f"<font size='14' color='{primary_color}'><b>{s['total_schools']}</b></font>", td_center),
                Paragraph(f"<font size='14' color='{primary_color}'><b>{s['total_companies']}</b></font>", td_center),
                Paragraph(f"<font size='14' color='{primary_color}'><b>{s['total_directorates']}</b></font>", td_center),
            ]
        ]
        t_summary = Table(summary_cards_data, colWidths=[3.6 * cm] * 5)
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_light),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 14))

        # --- Section 2: DIRETORIAS ATENDIDAS ---
        elements.append(Paragraph(
            f"2. DIRETORIAS DO IFRN ATENDIDAS ({report_data['directorates']['total_attended']} DIRETORIAS)",
            section_heading
        ))

        dir_breakdown = report_data['directorates']['breakdown']
        if dir_breakdown:
            dir_table_data = [
                [
                    Paragraph("Diretoria", th_style),
                    Paragraph("Código", th_style),
                    Paragraph("Qtd. Visitas", th_style),
                    Paragraph("Qtd. Visitantes", th_style),
                    Paragraph("Participação (%)", th_style),
                ]
            ]
            for d in dir_breakdown:
                dir_table_data.append([
                    Paragraph(f"<b>{d['name']}</b>", td_style),
                    Paragraph(d['department'].upper(), td_center),
                    Paragraph(str(d['visits_count']), td_center),
                    Paragraph(str(d['visitors_count']), td_center),
                    Paragraph(f"{d['percentage']}%", td_center),
                ])

            t_dir = Table(dir_table_data, colWidths=[6.0 * cm, 3.0 * cm, 3.0 * cm, 3.0 * cm, 3.0 * cm])
            t_dir.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), primary_color),
                ('BOX', (0, 0), (-1, -1), 0.5, border_color),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(t_dir)
        else:
            elements.append(Paragraph("<i>Nenhuma visita com vínculo a diretorias do CNAT no período selecionado.</i>", body_style))

        elements.append(Spacer(1, 14))

        # --- Section 3: PERFIL DO ESTUDANTE E ESCOLAS ---
        sp = report_data['students_profile']
        elements.append(Paragraph("3. PERFIL DO ESTUDANTE E ESCOLAS ATENDIDAS", section_heading))

        profile_text = (
            f"No período analisado, o laboratório recebeu estudantes de escolas públicas e privadas. "
            f"<b>Escola Pública:</b> {sp['public_visitors_count']} estudantes ({sp['public_percentage']}%) em {sp['public_visits_count']} visitas "
            f"({sp['public_schools_count']} escolas distintas). &nbsp;&nbsp;|&nbsp;&nbsp; "
            f"<b>Escola Privada:</b> {sp['private_visitors_count']} estudantes ({sp['private_percentage']}%) em {sp['private_visits_count']} visitas "
            f"({sp['private_schools_count']} escolas distintas)."
        )
        elements.append(Paragraph(profile_text, body_style))
        elements.append(Spacer(1, 6))

        # Table of attended schools
        schools_list = report_data['schools']['list']
        if schools_list:
            school_table_data = [
                [
                    Paragraph("Escola Atendida", th_style),
                    Paragraph("Perfil (Rede)", th_style),
                    Paragraph("Município/UF", th_style),
                    Paragraph("Visitas", th_style),
                    Paragraph("Total Estudantes", th_style),
                ]
            ]
            for s_item in schools_list:
                school_table_data.append([
                    Paragraph(f"<b>{s_item['name']}</b>", td_style),
                    Paragraph(s_item['school_type_display'], td_center),
                    Paragraph(f"{s_item['city']} / {s_item['state']}", td_center),
                    Paragraph(str(s_item['visits_count']), td_center),
                    Paragraph(str(s_item['total_visitors']), td_center),
                ])

            t_schools = Table(school_table_data, colWidths=[7.0 * cm, 3.0 * cm, 3.5 * cm, 2.0 * cm, 2.5 * cm])
            t_schools.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
                ('BOX', (0, 0), (-1, -1), 0.5, border_color),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(t_schools)
        else:
            elements.append(Paragraph("<i>Nenhuma visita escolar registrada no período selecionado.</i>", body_style))

        elements.append(Spacer(1, 14))

        # --- Section 4: EMPRESAS ATENDIDAS E INCUBADORA DO IFRN ---
        comp_profile = report_data['companies']
        elements.append(Paragraph(
            f"4. EMPRESAS ATENDIDAS E INCUBADORA DO IFRN ({comp_profile['total_companies']} EMPRESAS)",
            section_heading
        ))

        comp_intro = (
            f"<b>Incubadas pelo IFRN:</b> {comp_profile['incubated_companies_count']} empresas "
            f"({comp_profile['incubated_visits_count']} visitas) &nbsp;&nbsp;|&nbsp;&nbsp; "
            f"<b>Não Incubadas (Externas):</b> {comp_profile['non_incubated_companies_count']} empresas "
            f"({comp_profile['non_incubated_visits_count']} visitas)"
        )
        elements.append(Paragraph(comp_intro, body_style))
        elements.append(Spacer(1, 6))

        companies_list = comp_profile['list']
        if companies_list:
            comp_table_data = [
                [
                    Paragraph("Empresa", th_style),
                    Paragraph("CNPJ", th_style),
                    Paragraph("Incubada no IFRN?", th_style),
                    Paragraph("Visitas", th_style),
                    Paragraph("Visitantes", th_style),
                ]
            ]
            for c_item in companies_list:
                inc_text = "<b>Sim (Incubada)</b>" if c_item['is_incubated'] else "Não (Externa)"
                comp_table_data.append([
                    Paragraph(f"<b>{c_item['name']}</b>", td_style),
                    Paragraph(c_item['cnpj'], td_center),
                    Paragraph(inc_text, td_center),
                    Paragraph(str(c_item['visits_count']), td_center),
                    Paragraph(str(c_item['total_visitors']), td_center),
                ])

            t_comp = Table(comp_table_data, colWidths=[6.5 * cm, 3.5 * cm, 3.5 * cm, 2.0 * cm, 2.5 * cm])
            t_comp.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), primary_color),
                ('BOX', (0, 0), (-1, -1), 0.5, border_color),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(t_comp)
        else:
            elements.append(Paragraph("<i>Nenhuma empresa registrada no período selecionado.</i>", body_style))

        elements.append(Spacer(1, 14))

        # --- Section 5: DISTRIBUIÇÃO MENSAL DE VISITAS DE ESCOLAS ---
        elements.append(KeepTogether([
            Paragraph(f"5. DISTRIBUIÇÃO MENSAL DE VISITAS ESCOLARES ({report_data['period']['year']})", section_heading),
            Paragraph("Quantidade de visitas de escolas realizadas em cada mês do ano:", body_style),
            Spacer(1, 6),
        ]))

        monthly_data = report_data['monthly_school_visits']
        month_header = [Paragraph(m['name'], th_style) for m in monthly_data]
        month_vals = [
            Paragraph(f"<b>{m['visits_count']}</b>", td_center) for m in monthly_data
        ]
        month_visitors = [
            Paragraph(f"<font size='7' color='{text_muted}'>{m['visitors_count']} est.</font>", td_center) for m in monthly_data
        ]

        t_monthly = Table(
            [month_header, month_vals, month_visitors],
            colWidths=[1.5 * cm] * 12
        )
        t_monthly.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('BACKGROUND', (0, 1), (-1, -1), bg_light),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_monthly)

        doc.build(elements, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()
