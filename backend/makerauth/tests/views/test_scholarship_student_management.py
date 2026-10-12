from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from makerauth.models import User
from makerauth.services import UserService


class ScholarshipStudentManagementTests(APITestCase):

    def setUp(self):
        self.owner_group, _ = Group.objects.get_or_create(name="Owners")
        self.manager_group, _ = Group.objects.get_or_create(name="Managers")
        self.scholarship_group, _ = Group.objects.get_or_create(name="Scholarship Students")
        self.requester_group, _ = Group.objects.get_or_create(name="Requesters")

        # Owner user
        self.owner = User.objects.create_user(
            cpf="11144477735",
            email="owner@maker.com",
            name="Owner User",
            cellphone="84999990001",
            bond="public_servant",
            password="password123",
        )
        self.owner.groups.add(self.owner_group)

        # Manager user (not a scholarship student)
        self.manager = User.objects.create_user(
            cpf="22255588846",
            email="manager@maker.com",
            name="Manager User",
            cellphone="84999990002",
            bond="public_servant",
            password="password123",
        )
        self.manager.groups.add(self.manager_group)

        # Regular Requester user
        self.requester = User.objects.create_user(
            cpf="33366699957",
            email="requester@maker.com",
            name="Requester User",
            cellphone="84999990003",
            bond="external",
            password="password123",
        )
        self.requester.groups.add(self.requester_group)

        # Scholarship Student (active)
        self.student = User.objects.create_user(
            cpf="44477711107",
            email="student@maker.com",
            name="Scholarship Student",
            cellphone="84999990004",
            bond="student",
            enrollment="20241014040001",
            password="password123",
            is_active=True,
        )
        self.student.groups.add(self.scholarship_group)

    # --- PROMOTE BOLSISTA TESTS ---
    def test_owner_can_promote_bolsista_to_manager(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:scholarship-students-promote', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.refresh_from_db()
        self.assertTrue(self.student.groups.filter(name="Managers").exists())
        self.assertTrue(self.student.groups.filter(name="Scholarship Students").exists())

    def test_manager_cannot_promote_bolsista(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse('makerauth:scholarship-students-promote', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.student.refresh_from_db()
        self.assertFalse(self.student.groups.filter(name="Managers").exists())

    def test_requester_cannot_promote_bolsista(self):
        self.client.force_authenticate(user=self.requester)
        url = reverse('makerauth:scholarship-students-promote', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_promote_bolsista(self):
        url = reverse('makerauth:scholarship-students-promote', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- REMOVE FROM MANAGER GROUP TESTS ---
    def test_owner_can_remove_person_from_manager_group(self):
        # Student was promoted to manager
        self.student.groups.add(self.manager_group)

        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:scholarship-students-remove-manager', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.refresh_from_db()
        self.assertFalse(self.student.groups.filter(name="Managers").exists())
        self.assertTrue(self.student.groups.filter(name="Scholarship Students").exists())

    def test_owner_can_delete_person_from_manager_group(self):
        self.student.groups.add(self.manager_group)

        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:scholarship-students-remove-manager', args=[self.student.id])

        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.refresh_from_db()
        self.assertFalse(self.student.groups.filter(name="Managers").exists())

    def test_manager_cannot_remove_person_from_manager_group(self):
        self.student.groups.add(self.manager_group)

        self.client.force_authenticate(user=self.manager)
        url = reverse('makerauth:scholarship-students-remove-manager', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.student.refresh_from_db()
        self.assertTrue(self.student.groups.filter(name="Managers").exists())

    def test_remove_manager_fails_if_user_not_in_managers(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:scholarship-students-remove-manager', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

    # --- DEMOTE BOLSISTA TO REQUESTER TESTS ---
    def test_owner_can_demote_bolsista_to_requester(self):
        # Give student both scholarship and manager groups
        self.student.groups.add(self.manager_group)

        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:scholarship-students-demote-to-requester', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.student.refresh_from_db()
        # Must be removed from scholarship and manager, and left only in requester
        self.assertFalse(self.student.groups.filter(name="Scholarship Students").exists())
        self.assertFalse(self.student.groups.filter(name="Managers").exists())
        self.assertTrue(self.student.groups.filter(name="Requesters").exists())
        self.assertEqual(self.student.groups.count(), 1)

    def test_manager_cannot_demote_bolsista_to_requester(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse('makerauth:scholarship-students-demote-to-requester', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.student.refresh_from_db()
        self.assertTrue(self.student.groups.filter(name="Scholarship Students").exists())
        self.assertFalse(self.student.groups.filter(name="Requesters").exists())

    def test_anonymous_cannot_demote_bolsista_to_requester(self):
        url = reverse('makerauth:scholarship-students-demote-to-requester', args=[self.student.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- DIRECT SERVICE TESTS ---
    def test_user_service_methods(self):
        # 1. Promote to manager
        UserService.add_user_in_managers_group(self.student)
        self.student.refresh_from_db()
        self.assertTrue(self.student.groups.filter(name="Managers").exists())

        # 2. Remove from manager
        UserService.remove_user_from_managers_group(self.student)
        self.student.refresh_from_db()
        self.assertFalse(self.student.groups.filter(name="Managers").exists())
        self.assertTrue(self.student.groups.filter(name="Scholarship Students").exists())

        # 3. Demote from scholarship to requester
        UserService.remove_scholarship_student_to_requester(self.student)
        self.student.refresh_from_db()
        self.assertFalse(self.student.groups.filter(name="Scholarship Students").exists())
        self.assertFalse(self.student.groups.filter(name="Managers").exists())
        self.assertTrue(self.student.groups.filter(name="Requesters").exists())
        self.assertEqual(self.student.groups.count(), 1)

    # --- MANAGERS VIEWSET TESTS ---
    def test_managers_viewset_owner_can_remove(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse('makerauth:managers-remove', args=[self.manager.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.manager.refresh_from_db()
        self.assertFalse(self.manager.groups.filter(name="Managers").exists())

    def test_managers_viewset_non_owner_forbidden(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse('makerauth:managers-remove', args=[self.manager.id])

        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
