from django.test import TestCase

from makerapp.models import Company, School, Visit
from makerapp.serializers import CompanySerializer, SchoolSerializer, VisitSerializer, VisitCloseSerializer, VisitStatusUpdateSerializer
from makerauth.models import User


class SchoolSerializerTest(TestCase):

    def test_school_serializer_contains_expected_fields(self):
        school = School.objects.create(name="Escola Teste", school_type="public", city="Natal", state="RN")

        serializer = SchoolSerializer(school)

        self.assertEqual(serializer.data["name"], school.name)
        self.assertEqual(serializer.data["school_type"], school.school_type)


class CompanySerializerTest(TestCase):

    def test_company_serializer_contains_expected_fields(self):
        company = Company.objects.create(name="Empresa Teste", cnpj="12345678000195", is_incubated=True)

        serializer = CompanySerializer(company)

        self.assertEqual(serializer.data["name"], company.name)
        self.assertTrue(serializer.data["is_incubated"])


class VisitSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            cpf="52998224725",
            email="requester@example.com",
            name="Requester Teste",
            cellphone="11999999999",
            bond="external",
            password="senha1234",
        )
        self.school = School.objects.create(name="Escola Teste", school_type="public", city="Natal", state="RN")
        self.company = Company.objects.create(name="Empresa Teste", cnpj="12345678000196", is_incubated=False)

    def test_visit_serializer_requires_school_when_requester_origin_is_school(self):
        data = {
            "visit_type": "fast",
            "scheduling_date": "2024-06-15T09:00:00Z",
            "forecast_number_of_visitors": 10,
            "requester_origin": "school",
            "requester": self.user.pk,
        }

        serializer = VisitSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("school", serializer.errors)

    def test_visit_serializer_requires_company_when_requester_origin_is_company(self):
        data = {
            "visit_type": "fast",
            "scheduling_date": "2024-06-15T09:00:00Z",
            "forecast_number_of_visitors": 10,
            "requester_origin": "company",
            "requester": self.user.pk,
        }

        serializer = VisitSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("company", serializer.errors)

    def test_visit_serializer_requires_department_when_requester_origin_is_cnat(self):
        data = {
            "visit_type": "fast",
            "scheduling_date": "2024-06-15T09:00:00Z",
            "forecast_number_of_visitors": 10,
            "requester_origin": "cnat",
            "requester": self.user.pk,
        }

        serializer = VisitSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("cnat_department", serializer.errors)

    def test_visit_serializer_create_with_school_origin(self):
        data = {
            "visit_type": "technical",
            "scheduling_date": "2024-06-15T09:00:00Z",
            "forecast_number_of_visitors": 15,
            "requester_origin": "school",
            "requester": self.user.pk,
            "school": self.school.pk,
        }

        serializer = VisitSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        visit = serializer.save()

        self.assertEqual(visit.school, self.school)
        self.assertEqual(visit.requester, self.user)


class VisitStatusUpdateSerializerTest(TestCase):

    def test_visit_status_update_serializer_accepts_status(self):
        serializer = VisitStatusUpdateSerializer(data={"acceptance_status": "accepted"})

        self.assertTrue(serializer.is_valid(), serializer.errors)


class VisitCloseSerializerTest(TestCase):

    def test_visit_close_serializer_requires_real_number_of_visitors_when_closing(self):
        serializer = VisitCloseSerializer(data={"is_visit_closed": True})

        self.assertFalse(serializer.is_valid())
        self.assertIn("real_number_of_visitors", serializer.errors)

    def test_visit_close_serializer_allows_closing_with_real_number_of_visitors(self):
        serializer = VisitCloseSerializer(data={"is_visit_closed": True, "real_number_of_visitors": 12})

        self.assertTrue(serializer.is_valid(), serializer.errors)
