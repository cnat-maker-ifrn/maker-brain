import io
import datetime
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.test import APITestCase

from makerapp.models import Visit
from makerapp.services import VisitService
from makerauth.models import User


def get_test_image():
    file_obj = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="blue")
    image.save(file_obj, format="JPEG")
    file_obj.seek(0)
    return SimpleUploadedFile("visit.jpg", file_obj.read(), content_type="image/jpeg")


class VisitCloseTests(APITestCase):

    def setUp(self):
        self.owner_group, _ = Group.objects.get_or_create(name="Owners")
        self.manager_group, _ = Group.objects.get_or_create(name="Managers")
        self.scholarship_group, _ = Group.objects.get_or_create(name="Scholarship Students")
        self.requester_group, _ = Group.objects.get_or_create(name="Requesters")

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

        self.scheduling_date = datetime.datetime(2026, 11, 10, 9, 0, 0, tzinfo=datetime.timezone.utc)
        self.visit = Visit.objects.create(
            visit_type="fast",
            scheduling_date=self.scheduling_date,
            forecast_number_of_visitors=15,
            requester_origin="external",
            requester=self.requester,
            acceptance_status="accepted",
        )

    def test_service_close_requires_accepted_status(self):
        self.visit.acceptance_status = "pending"
        self.visit.save()

        with self.assertRaises(ValidationError) as ctx:
            VisitService.close_visit(self.visit, {
                "real_number_of_visitors": 12,
                "photo": get_test_image(),
                "observations": "Tudo correu bem",
                "description": "Visita ao laboratório",
            })
        self.assertIn("acceptance_status", ctx.exception.message_dict)

    def test_service_close_requires_not_already_closed(self):
        self.visit.is_visit_closed = True
        self.visit.save()

        with self.assertRaises(ValidationError) as ctx:
            VisitService.close_visit(self.visit, {
                "real_number_of_visitors": 12,
                "photo": get_test_image(),
                "observations": "Tudo correu bem",
                "description": "Visita ao laboratório",
            })
        self.assertIn("is_visit_closed", ctx.exception.message_dict)

    def test_service_close_requires_all_mandatory_fields(self):
        with self.assertRaises(ValidationError) as ctx:
            VisitService.close_visit(self.visit, {})
        errors = ctx.exception.message_dict
        self.assertIn("real_number_of_visitors", errors)
        self.assertIn("photo", errors)
        self.assertIn("observations", errors)
        self.assertIn("description", errors)

    def test_service_close_requires_positive_visitors(self):
        with self.assertRaises(ValidationError) as ctx:
            VisitService.close_visit(self.visit, {
                "real_number_of_visitors": 0,
                "photo": get_test_image(),
                "observations": "Obs",
                "description": "Desc",
            })
        self.assertIn("real_number_of_visitors", ctx.exception.message_dict)

    def test_service_close_success(self):
        photo = get_test_image()
        closed = VisitService.close_visit(self.visit, {
            "real_number_of_visitors": 14,
            "photo": photo,
            "observations": "Ótima participação dos alunos",
            "description": "Apresentação de robótica e impressão 3D",
        })

        self.assertTrue(closed.is_visit_closed)
        self.assertTrue(closed.has_visited)
        self.assertEqual(closed.real_number_of_visitors, 14)
        self.assertEqual(closed.observations, "Ótima participação dos alunos")
        self.assertEqual(closed.description, "Apresentação de robótica e impressão 3D")
        self.assertTrue(bool(closed.photo))

    def test_endpoint_close_requires_authentication(self):
        url = f"/api/makerapp/visits/{self.visit.id}/close/"
        response = self.client.patch(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_close_forbidden_for_regular_requester(self):
        self.client.force_authenticate(user=self.requester)
        url = f"/api/makerapp/visits/{self.visit.id}/close/"
        response = self.client.patch(url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_endpoint_close_validation_errors(self):
        self.client.force_authenticate(user=self.owner)
        url = f"/api/makerapp/visits/{self.visit.id}/close/"
        response = self.client.patch(url, {}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("real_number_of_visitors", response.data)
        self.assertIn("photo", response.data)
        self.assertIn("observations", response.data)
        self.assertIn("description", response.data)

    def test_endpoint_close_success(self):
        self.client.force_authenticate(user=self.owner)
        url = f"/api/makerapp/visits/{self.visit.id}/close/"
        data = {
            "real_number_of_visitors": 18,
            "photo": get_test_image(),
            "observations": "Visitantes muito interessados.",
            "description": "Visita técnica pelas bancadas de prototipagem.",
        }
        response = self.client.patch(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.visit.refresh_from_db()
        self.assertTrue(self.visit.is_visit_closed)
        self.assertTrue(self.visit.has_visited)
        self.assertEqual(self.visit.real_number_of_visitors, 18)
        self.assertEqual(self.visit.observations, "Visitantes muito interessados.")
        self.assertEqual(self.visit.description, "Visita técnica pelas bancadas de prototipagem.")
        self.assertTrue(bool(self.visit.photo))

    def test_endpoint_close_success_via_post(self):
        self.client.force_authenticate(user=self.owner)
        url = f"/api/makerapp/visits/{self.visit.id}/close/"
        data = {
            "real_number_of_visitors": 20,
            "photo": get_test_image(),
            "observations": "Observação teste via post",
            "description": "Descrição teste via post",
        }
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.visit.refresh_from_db()
        self.assertTrue(self.visit.is_visit_closed)
        self.assertEqual(self.visit.real_number_of_visitors, 20)

    def test_closed_visit_details_hidden_for_requester(self):
        # Close visit first
        VisitService.close_visit(self.visit, {
            "real_number_of_visitors": 15,
            "photo": get_test_image(),
            "observations": "Observações internas",
            "description": "Descrição detalhada pós visita",
        })

        self.client.force_authenticate(user=self.requester)
        response = self.client.get("/api/makerapp/visits/mine/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        visit_data = next(v for v in response.data if v["id"] == self.visit.id)
        self.assertTrue(visit_data["is_visit_closed"])
        self.assertIsNone(visit_data["photo"])
        self.assertIsNone(visit_data["observations"])
        self.assertIsNone(visit_data["description"])
        self.assertIsNone(visit_data["real_number_of_visitors"])

    def test_closed_visit_details_visible_for_scholarship_student(self):
        VisitService.close_visit(self.visit, {
            "real_number_of_visitors": 15,
            "photo": get_test_image(),
            "observations": "Observações internas",
            "description": "Descrição detalhada pós visita",
        })

        scholarship_student = User.objects.create_user(
            cpf="22255588846",
            email="student@maker.com",
            name="Student User",
            cellphone="84999990005",
            bond="student",
            enrollment="20241014040001",
            password="password123",
        )
        scholarship_student.groups.add(self.scholarship_group)

        self.client.force_authenticate(user=scholarship_student)
        response = self.client.get(f"/api/makerapp/visits/{self.visit.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["real_number_of_visitors"], 15)
        self.assertEqual(response.data["observations"], "Observações internas")
        self.assertEqual(response.data["description"], "Descrição detalhada pós visita")
        self.assertIsNotNone(response.data["photo"])
