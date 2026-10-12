import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const reportService = {
  async getReportData({ year, month } = {}) {
    const url = endpoints.reports.data({ year, month });
    const response = await apiClient.get(url);
    return response.data;
  },

  async downloadReportPdf({ year, month } = {}) {
    try {
      const url = endpoints.reports.pdf({ year, month });
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const suffix = month ? `${year}_${String(month).padStart(2, '0')}` : `${year || new Date().getFullYear()}_anual`;
      link.setAttribute('download', `relatorio_cnat_maker_${suffix}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (err) {
      console.warn('Backend PDF download error, attempting client-side generation fallback:', err);
      // Fallback: fetch data if not available and generate with jsPDF
      const data = await this.getReportData({ year, month });
      this.generateClientPdf(data);
      return true;
    }
  },

  generateClientPdf(reportData) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [15, 81, 50]; // #0f5132
    const secondaryColor = [25, 135, 84]; // #198754
    const darkSlate = [30, 41, 59]; // #1e293b
    const mutedSlate = [100, 116, 139]; // #64748b

    let y = 18;

    // Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedSlate);
    doc.text('CNAT MAKER • LABORATÓRIO DE FABRICAÇÃO DIGITAL', 105, y, { align: 'center' });

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('RELATÓRIO DE ATENDIMENTOS E VISITAS', 105, y, { align: 'center' });

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkSlate);
    const metaText = `Período: ${reportData.period.label}   |   Emitido em: ${reportData.generated_at}`;
    doc.text(metaText, 105, y, { align: 'center' });

    y += 4;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(14, y, 196, y);

    y += 8;

    // Section 1: Indicadores
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('1. RESUMO DOS PRINCIPAIS INDICADORES', 14, y);
    y += 3;

    const s = reportData.summary;
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [
        [
          'Total Visitantes',
          'Total Visitas',
          'Escolas Atendidas',
          'Empresas Atendidas',
          'Diretorias Atendidas',
        ],
      ],
      body: [
        [
          String(s.total_visitors),
          String(s.total_visits),
          String(s.total_schools),
          String(s.total_companies),
          String(s.total_directorates),
        ],
      ],
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
      },
      bodyStyles: {
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 12,
        textColor: primaryColor,
      },
      styles: {
        cellPadding: 3,
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Section 2: Diretorias Atendidas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(
      `2. DIRETORIAS DO IFRN ATENDIDAS (${reportData.directorates.total_attended} DIRETORIAS)`,
      14,
      y
    );
    y += 3;

    const dirBreakdown = reportData.directorates.breakdown || [];
    if (dirBreakdown.length > 0) {
      const dirBody = dirBreakdown.map((d) => [
        d.name,
        d.department.toUpperCase(),
        String(d.visits_count),
        String(d.visitors_count),
        `${d.percentage}%`,
      ]);

      autoTable(doc, {
        startY: y,
        theme: 'striped',
        head: [['Diretoria', 'Código', 'Qtd. Visitas', 'Visitantes', 'Participação (%)']],
        body: dirBody,
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkSlate,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        styles: { cellPadding: 2.5 },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...mutedSlate);
      doc.text('Nenhuma diretoria registrada no período selecionado.', 14, y + 4);
      y += 10;
    }

    // Section 3: Perfil do Estudante e Escolas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('3. PERFIL DO ESTUDANTE E ESCOLAS ATENDIDAS', 14, y);
    y += 4;

    const sp = reportData.students_profile;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);
    const profileSummary = `Pública: ${sp.public_visitors_count} estudantes (${sp.public_percentage}%) em ${sp.public_visits_count} visitas. | Privada: ${sp.private_visitors_count} estudantes (${sp.private_percentage}%) em ${sp.private_visits_count} visitas.`;
    doc.text(profileSummary, 14, y);
    y += 3;

    const schoolsList = reportData.schools.list || [];
    if (schoolsList.length > 0) {
      const schoolsBody = schoolsList.map((sItem) => [
        sItem.name,
        sItem.school_type_display,
        `${sItem.city} / ${sItem.state}`,
        String(sItem.visits_count),
        String(sItem.total_visitors),
      ]);

      autoTable(doc, {
        startY: y,
        theme: 'striped',
        head: [['Escola Atendida', 'Rede', 'Município/UF', 'Visitas', 'Total Estudantes']],
        body: schoolsBody,
        headStyles: {
          fillColor: secondaryColor,
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkSlate,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        styles: { cellPadding: 2.5 },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...mutedSlate);
      doc.text('Nenhuma visita escolar registrada no período selecionado.', 14, y + 4);
      y += 10;
    }

    // Check if new page is needed for Section 4 and 5
    if (y > 220) {
      doc.addPage();
      y = 18;
    }

    // Section 4: Empresas Atendidas e Incubadora
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(
      `4. EMPRESAS ATENDIDAS E INCUBADORA DO IFRN (${reportData.companies.total_companies} EMPRESAS)`,
      14,
      y
    );
    y += 4;

    const comp = reportData.companies;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkSlate);
    const compSummary = `Incubadas no IFRN: ${comp.incubated_companies_count} empresas (${comp.incubated_visits_count} visitas) | Externas: ${comp.non_incubated_companies_count} empresas (${comp.non_incubated_visits_count} visitas)`;
    doc.text(compSummary, 14, y);
    y += 3;

    const compList = comp.list || [];
    if (compList.length > 0) {
      const compBody = compList.map((c) => [
        c.name,
        c.cnpj,
        c.is_incubated ? 'Sim (Incubada)' : 'Não (Externa)',
        String(c.visits_count),
        String(c.total_visitors),
      ]);

      autoTable(doc, {
        startY: y,
        theme: 'striped',
        head: [['Empresa Atendida', 'CNPJ', 'Incubada no IFRN?', 'Visitas', 'Total Visitantes']],
        body: compBody,
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkSlate,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        styles: { cellPadding: 2.5 },
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...mutedSlate);
      doc.text('Nenhuma visita de empresa registrada no período selecionado.', 14, y + 4);
      y += 10;
    }

    if (y > 230) {
      doc.addPage();
      y = 18;
    }

    // Section 5: Distribuição mensal de escolas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(`5. DISTRIBUIÇÃO MENSAL DE VISITAS ESCOLARES (${reportData.period.year})`, 14, y);
    y += 3;

    const monthly = reportData.monthly_school_visits || [];
    const monthHeader = monthly.map((m) => m.name);
    const monthVisits = monthly.map((m) => String(m.visits_count));

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [monthHeader],
      body: [monthVisits],
      headStyles: {
        fillColor: secondaryColor,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8,
      },
      bodyStyles: {
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 9,
        textColor: primaryColor,
      },
      styles: { cellPadding: 2.5 },
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...mutedSlate);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 287, 196, 287);
      doc.text(`CNAT Maker • Sistema MakerBrain • Página ${i} de ${pageCount}`, 105, 292, {
        align: 'center',
      });
    }

    const suffix = reportData.period.month
      ? `${reportData.period.year}_${String(reportData.period.month).padStart(2, '0')}`
      : `${reportData.period.year}_anual`;
    doc.save(`relatorio_cnat_maker_${suffix}.pdf`);
  },
};
