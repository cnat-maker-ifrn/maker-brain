import datetime
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from makerapp.models import Visit, Service
from makerauth.models import User


class CancellationAndServiceManagementTests(APITestCase):

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

        self.manager = User.objects.create_user(
            cpf="22255588846",
            email="manager@maker.com",
            name="Manager User",
            cellphone="84999990002",
            bond="public_servant",
            password="password123",
        )
        self.manager.groups.add(self.manager_group)

        self.scholarship_student = User.objects.create_user(
            cpf="44477711107",
            email="scholarship@maker.com",
            name="Scholarship Student",
            cellphone="84999990003",
            bond="student",
            enrollment="20241014040001",
            password="password123",
            is_active=True,
        )
        self.scholarship_student.groups.add(self.scholarship_group)

        self.requester1 = User.objects.create_user(
            cpf="33366699957",
            email="req1@maker.com",
            name="Requester 1",
            cellphone="84999990004",
            bond="external",
            password="password123",
        )
        self.requester1.groups.add(self.requester_group)

        self.requester2 = User.objects.create_user(
            cpf="52998224725",
            email="req2@maker.com",
            name="Requester 2",
            cellphone="84999990005",
            bond="external",
            password="password123",
        )
        self.requester2.groups.add(self.requester_group)

        self.scheduling_date = datetime.datetime(2026, 12, 10, 9, 0, 0, tzinfo=datetime.timezone.utc)

    def _create_service(self, requester, acceptance_status="pending", is_completed=False):
        uploaded_file = SimpleUploadedFile("model.stl", b"solid model ... endsolid", content_type="application/octet-stream")
        return Service.objects.create(
            name="3d_printing",
            file=uploaded_file,
            description="Peça teste",
            quantity=2,
            acceptance_status=acceptance_status,
            is_completed=is_completed,
            requester=requester,
        )

    def _create_visit(self, requester, acceptance_status="pending", is_closed=False):
        return Visit.objects.create(
            visit_type="fast",
            scheduling_date=self.scheduling_date,
            forecast_number_of_visitors=10,
            requester_origin="external",
            requester=requester,
            acceptance_status=acceptance_status,
            is_visit_closed=is_closed,
        )

    # --- SERVICE MODEL TESTS ---

    def test_service_model_has_is_completed_field(self):
        service = self._create_service(self.requester1)
        self.assertFalse(service.is_completed)

        service.is_completed = True
        service.save()
        service.refresh_from_db()
        self.assertTrue(service.is_completed)

    # --- VISIT CANCELLATION TESTS ---

    def test_requester_can_cancel_own_pending_visit(self):
        visit = self._create_visit(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.requester1)

        response = self.client.delete(f"/api/makerapp/visits/{visit.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Visit.objects.filter(id=visit.id).exists())

    def test_requester_cannot_cancel_own_accepted_visit(self):
        visit = self._create_visit(self.requester1, acceptance_status="accepted")
        self.client.force_authenticate(user=self.requester1)

        response = self.client.delete(f"/api/makerapp/visits/{visit.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Visit.objects.filter(id=visit.id).exists())

    def test_requester_cannot_cancel_other_user_visit(self):
        visit = self._create_visit(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.requester2)

        response = self.client.delete(f"/api/makerapp/visits/{visit.id}/")
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        self.assertTrue(Visit.objects.filter(id=visit.id).exists())

    def test_scholarship_student_can_cancel_other_user_accepted_visit(self):
        visit = self._create_visit(self.requester1, acceptance_status="accepted")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.delete(f"/api/makerapp/visits/{visit.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Visit.objects.filter(id=visit.id).exists())

    def test_manager_and_owner_can_cancel_other_user_accepted_visit(self):
        visit1 = self._create_visit(self.requester1, acceptance_status="accepted")
        visit2 = self._create_visit(self.requester2, acceptance_status="accepted")

        self.client.force_authenticate(user=self.manager)
        res1 = self.client.delete(f"/api/makerapp/visits/{visit1.id}/")
        self.assertEqual(res1.status_code, status.HTTP_204_NO_CONTENT)

        self.client.force_authenticate(user=self.owner)
        res2 = self.client.delete(f"/api/makerapp/visits/{visit2.id}/")
        self.assertEqual(res2.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_cancel_own_accepted_visit(self):
        visit = self._create_visit(self.scholarship_student, acceptance_status="accepted")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.delete(f"/api/makerapp/visits/{visit.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Visit.objects.filter(id=visit.id).exists())

    # --- SERVICE CANCELLATION TESTS ---

    def test_requester_can_cancel_own_pending_service(self):
        service = self._create_service(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.requester1)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())

    def test_requester_cannot_cancel_own_accepted_service(self):
        service = self._create_service(self.requester1, acceptance_status="accepted")
        self.client.force_authenticate(user=self.requester1)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Service.objects.filter(id=service.id).exists())

    def test_requester_cannot_cancel_other_user_service(self):
        service = self._create_service(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.requester2)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        self.assertTrue(Service.objects.filter(id=service.id).exists())

    def test_scholarship_student_can_cancel_other_user_accepted_service(self):
        service = self._create_service(self.requester1, acceptance_status="accepted")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())

    def test_scholarship_student_can_cancel_completed_service(self):
        service = self._create_service(self.requester1, acceptance_status="accepted", is_completed=True)
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())

    def test_manager_and_owner_can_cancel_other_user_accepted_service(self):
        service1 = self._create_service(self.requester1, acceptance_status="accepted")
        service2 = self._create_service(self.requester2, acceptance_status="accepted")

        self.client.force_authenticate(user=self.manager)
        res1 = self.client.delete(f"/api/makerapp/services/{service1.id}/")
        self.assertEqual(res1.status_code, status.HTTP_204_NO_CONTENT)

        self.client.force_authenticate(user=self.owner)
        res2 = self.client.delete(f"/api/makerapp/services/{service2.id}/")
        self.assertEqual(res2.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_cancel_own_accepted_service(self):
        service = self._create_service(self.scholarship_student, acceptance_status="accepted")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.delete(f"/api/makerapp/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())

    # --- SERVICE MANAGEMENT ACTION TESTS ---

    def test_scholarship_student_can_list_all_services(self):
        self._create_service(self.requester1)
        self._create_service(self.requester2)

        self.client.force_authenticate(user=self.scholarship_student)
        response = self.client.get("/api/makerapp/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_requester_cannot_list_all_services(self):
        self.client.force_authenticate(user=self.requester1)
        response = self.client.get("/api/makerapp/services/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_scholarship_student_can_accept_service(self):
        service = self._create_service(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.post(f"/api/makerapp/services/{service.id}/accept/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        service.refresh_from_db()
        self.assertEqual(service.acceptance_status, "accepted")

    def test_scholarship_student_can_reject_service(self):
        service = self._create_service(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.post(f"/api/makerapp/services/{service.id}/reject/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        service.refresh_from_db()
        self.assertEqual(service.acceptance_status, "rejected")

    def test_scholarship_student_can_complete_service(self):
        service = self._create_service(self.requester1, acceptance_status="accepted", is_completed=False)
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.post(f"/api/makerapp/services/{service.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        service.refresh_from_db()
        self.assertTrue(service.is_completed)

    def test_cannot_complete_pending_service(self):
        service = self._create_service(self.requester1, acceptance_status="pending")
        self.client.force_authenticate(user=self.scholarship_student)

        response = self.client.post(f"/api/makerapp/services/{service.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
