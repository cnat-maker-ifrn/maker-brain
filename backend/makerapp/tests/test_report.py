from datetime import datetime
from django.contrib.auth.models import Group
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from makerapp.models import School, Company, Visit
from makerapp.report_service import ReportService
from makerauth.models import User


class ReportServiceAndViewsTestCase(APITestCase):

    def setUp(self):
        # Groups
        self.owner_group, _ = Group.objects.get_or_create(name="Owners")
        self.manager_group, _ = Group.objects.get_or_create(name="Managers")
        self.scholarship_group, _ = Group.objects.get_or_create(name="Scholarship Students")
        self.requester_group, _ = Group.objects.get_or_create(name="Requesters")

        # Users
        self.owner = User.objects.create_user(
            cpf="11144477735",
            email="owner@maker.com",
            name="Owner User",
            cellphone="84999990001",
            bond="public_servant",
            password="password123",
        )
        self.owner.groups.add(self.owner_group)

        self.requester = User.objects.create_user(
            cpf="33366699957",
            email="requester@maker.com",
            name="Requester User",
            cellphone="84999990003",
            bond="external",
            password="password123",
        )
        self.requester.groups.add(self.requester_group)

        # Schools
        self.public_school = School.objects.create(
            name="Escola Estadual Winston Churchill",
            school_type="public",
            city="Natal",
            state="RN"
        )
        self.private_school = School.objects.create(
            name="Colégio Marista de Natal",
            school_type="private",
            city="Natal",
            state="RN"
        )

        # Companies
        self.incubated_company = Company.objects.create(
            name="Inova Maker Soluções",
            cnpj="11222333000144",
            is_incubated=True,
        )
        self.external_company = Company.objects.create(
            name="Empresa Externa LTDA",
            cnpj="55666777000188",
            is_incubated=False,
        )

        # Visits in 2026:
        # 1. School visit - public (May 2026) - Closed with has_visited=True, real_number_of_visitors=30
        Visit.objects.create(
            visit_type="technical",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 10, 14, 0)),
            forecast_number_of_visitors=25,
            real_number_of_visitors=30,
            has_visited=True,
            is_visit_closed=True,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="school",
            school=self.public_school,
        )

        # 2. School visit - private (May 2026) - Accepted, forecast=20
        Visit.objects.create(
            visit_type="fast",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 20, 10, 0)),
            forecast_number_of_visitors=20,
            real_number_of_visitors=None,
            has_visited=False,
            is_visit_closed=False,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="school",
            school=self.private_school,
        )

        # 3. School visit - public (August 2026) - Accepted, forecast=15
        Visit.objects.create(
            visit_type="childish",
            scheduling_date=timezone.make_aware(datetime(2026, 8, 15, 9, 0)),
            forecast_number_of_visitors=15,
            real_number_of_visitors=None,
            has_visited=False,
            is_visit_closed=False,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="school",
            school=self.public_school,
        )

        # 4. Department visit - DIATINF (May 2026)
        Visit.objects.create(
            visit_type="technical",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 5, 15, 0)),
            forecast_number_of_visitors=10,
            real_number_of_visitors=12,
            has_visited=True,
            is_visit_closed=True,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="cnat",
            cnat_department="diatinf",
        )

        # 5. Department visit - DIAREN (May 2026)
        Visit.objects.create(
            visit_type="fast",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 18, 11, 0)),
            forecast_number_of_visitors=8,
            has_visited=True,
            is_visit_closed=True,
            real_number_of_visitors=8,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="cnat",
            cnat_department="diaren",
        )

        # 6. Company visit - Incubated (May 2026)
        Visit.objects.create(
            visit_type="technical",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 25, 16, 0)),
            forecast_number_of_visitors=5,
            real_number_of_visitors=5,
            has_visited=True,
            is_visit_closed=True,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="company",
            company=self.incubated_company,
        )

        # 7. Company visit - External (May 2026)
        Visit.objects.create(
            visit_type="technical",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 28, 14, 0)),
            forecast_number_of_visitors=6,
            real_number_of_visitors=6,
            has_visited=True,
            is_visit_closed=True,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="company",
            company=self.external_company,
        )

        # 8. Closed visit where visitors DID NOT ATTEND (has_visited=False, is_visit_closed=True)
        # MUST BE EXCLUDED from reports!
        Visit.objects.create(
            visit_type="fast",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 30, 10, 0)),
            forecast_number_of_visitors=40,
            has_visited=False,
            is_visit_closed=True,
            acceptance_status="accepted",
            requester=self.requester,
            requester_origin="school",
            school=self.public_school,
        )

        # 9. Rejected visit - MUST BE EXCLUDED!
        Visit.objects.create(
            visit_type="fast",
            scheduling_date=timezone.make_aware(datetime(2026, 5, 31, 10, 0)),
            forecast_number_of_visitors=50,
            has_visited=False,
            is_visit_closed=False,
            acceptance_status="rejected",
            requester=self.requester,
            requester_origin="school",
            school=self.public_school,
        )

    def test_report_service_full_year_aggregation(self):
        data = ReportService.get_report_data(year=2026)

        # Summary
        # Valid visits: #1 (30), #2 (20), #3 (15), #4 (12), #5 (8), #6 (5), #7 (6) = 96 visitors, 7 visits
        self.assertEqual(data['summary']['total_visits'], 7)
        self.assertEqual(data['summary']['total_visitors'], 96)
        self.assertEqual(data['summary']['total_schools'], 2)
        self.assertEqual(data['summary']['total_companies'], 2)
        self.assertEqual(data['summary']['total_directorates'], 2)

        # Directorates
        self.assertEqual(data['directorates']['total_attended'], 2)
        dept_names = [d['name'] for d in data['directorates']['breakdown']]
        self.assertIn('DIATINF', dept_names)
        self.assertIn('DIAREN', dept_names)

        # Student profile
        sp = data['students_profile']
        self.assertEqual(sp['public_schools_count'], 1)
        self.assertEqual(sp['private_schools_count'], 1)
        self.assertEqual(sp['public_visits_count'], 2) # #1 and #3
        self.assertEqual(sp['private_visits_count'], 1) # #2
        self.assertEqual(sp['public_visitors_count'], 45) # 30 + 15
        self.assertEqual(sp['private_visitors_count'], 20) # 20

        # Schools list
        schools = data['schools']['list']
        self.assertEqual(len(schools), 2)
        school_names = [s['name'] for s in schools]
        self.assertIn(self.public_school.name, school_names)
        self.assertIn(self.private_school.name, school_names)

        # Companies
        comp = data['companies']
        self.assertEqual(comp['total_companies'], 2)
        self.assertEqual(comp['incubated_companies_count'], 1)
        self.assertEqual(comp['non_incubated_companies_count'], 1)
        comp_names = [c['name'] for c in comp['list']]
        self.assertIn(self.incubated_company.name, comp_names)
        self.assertIn(self.external_company.name, comp_names)

        # Monthly school visits: month 5 has 2 visits, month 8 has 1 visit
        monthly = {m['month']: m['visits_count'] for m in data['monthly_school_visits']}
        self.assertEqual(monthly[5], 2)
        self.assertEqual(monthly[8], 1)
        self.assertEqual(monthly[1], 0)

    def test_report_service_month_filter(self):
        data = ReportService.get_report_data(year=2026, month=5)

        # Month 5 only (visit #3 in August is excluded)
        # Visits: #1 (30), #2 (20), #4 (12), #5 (8), #6 (5), #7 (6) = 81 visitors, 6 visits
        self.assertEqual(data['summary']['total_visits'], 6)
        self.assertEqual(data['summary']['total_visitors'], 81)
        self.assertEqual(data['period']['label'], "Maio de 2026")
        self.assertEqual(data['students_profile']['public_visits_count'], 1) # Only #1

    def test_report_service_pdf_generation(self):
        data = ReportService.get_report_data(year=2026, month=5)
        pdf_bytes = ReportService.generate_pdf(data)
        self.assertTrue(len(pdf_bytes) > 0)
        self.assertTrue(pdf_bytes.startswith(b'%PDF'))

    def test_report_viewset_permissions(self):
        # Anonymous user should get 401
        res = self.client.get('/api/makerapp/reports/data/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Requester user (not owner) should get 403
        self.client.force_authenticate(user=self.requester)
        res = self.client.get('/api/makerapp/reports/data/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Owner user should get 200
        self.client.force_authenticate(user=self.owner)
        res = self.client.get('/api/makerapp/reports/data/?year=2026&month=5')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('summary', res.data)
        self.assertIn('directorates', res.data)
        self.assertIn('students_profile', res.data)
        self.assertIn('schools', res.data)
        self.assertIn('companies', res.data)
        self.assertIn('monthly_school_visits', res.data)

    def test_report_viewset_pdf_download(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.get('/api/makerapp/reports/pdf/?year=2026&month=5')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res['Content-Type'], 'application/pdf')
        self.assertIn('relatorio_cnat_maker_2026_05.pdf', res['Content-Disposition'])
        self.assertTrue(res.content.startswith(b'%PDF'))
