from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from makerauth.models import User


class ProfileUpdateViewTest(APITestCase):

    def setUp(self):
        self.url = reverse('makerauth:current_user')
        self.user = User.objects.create_user(
            cpf="52998224725",
            email="testuser@example.com",
            name="Nome Original",
            cellphone="84999991111",
            bond="external",
            password="password123",
        )

    def test_anonymous_cannot_get_or_patch_profile(self):
        response_get = self.client.get(self.url)
        self.assertEqual(response_get.status_code, status.HTTP_401_UNAUTHORIZED)

        response_patch = self.client.patch(self.url, {"name": "Novo Nome"})
        self.assertEqual(response_patch.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_patch_name_and_cellphone(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "name": "Nome Atualizado",
            "cellphone": "(84) 98888-2222",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Nome Atualizado")
        self.assertEqual(response.data["cellphone"], "84988882222")

        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Nome Atualizado")
        self.assertEqual(self.user.cellphone, "84988882222")

    def test_patch_blank_name_fails(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(self.url, {"name": "   "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_patch_invalid_cellphone_fails(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(self.url, {"cellphone": "12345"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cellphone", response.data)

    def test_patch_immutable_fields_are_ignored(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "name": "Nome Alterado",
            "email": "hacked@example.com",
            "cpf": "11122233344",
            "bond": "student",
            "is_staff": True,
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Nome Alterado")
        self.assertEqual(self.user.email, "testuser@example.com")
        self.assertEqual(self.user.cpf, "52998224725")
        self.assertEqual(self.user.bond, "external")
        self.assertFalse(self.user.is_staff)

    def test_authenticated_can_change_password_successfully(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "password123",
            "new_password": "new_password_456",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new_password_456"))

        # Verify new password works for token generation
        login_res = self.client.post(
            reverse('makerauth:token_obtain_pair'),
            {"email": self.user.email, "password": "new_password_456"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_change_password_with_incorrect_current_password_fails(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "wrong_password",
            "new_password": "new_password_456",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("password123"))

    def test_change_password_missing_current_password_fails(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "new_password": "new_password_456",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)

    def test_change_password_missing_new_password_fails(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "password123",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_with_short_new_password_fails(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "password123",
            "new_password": "short",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_with_same_password_fails(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "current_password": "password123",
            "new_password": "password123",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_alongside_name_and_cellphone(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "name": "Nome Alterado Junto",
            "cellphone": "84977773333",
            "current_password": "password123",
            "new_password": "brand_new_password_123",
        }
        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, "Nome Alterado Junto")
        self.assertEqual(self.user.cellphone, "84977773333")
        self.assertTrue(self.user.check_password("brand_new_password_123"))

