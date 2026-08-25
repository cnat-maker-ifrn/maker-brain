from django.core.exceptions import ValidationError
from django.test import TestCase

from makerauth.models import User


class UserModelTest(TestCase):

    def _make_user(self, **kwargs):
        defaults = dict(
            cpf="39581481079",
            email="usuario@example.com",
            name="Usuário Teste",
            cellphone="11999999999",
            bond="student",
            enrollment="20240000000123",
            password="12345678"
        )
        defaults.update(kwargs)
        user = User(**defaults)
        return user

    def test_create_user(self):
        user = self._make_user()
        user.save()

        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get(pk=user.pk).email, "usuario@example.com")
        self.assertTrue(User.objects.get(pk=user.pk).is_active)

    def test_student_requires_enrollment(self):
        user = self._make_user(bond="student", enrollment=None)

        with self.assertRaises(ValidationError):
            user.save()

    def test_student_enrollment_must_have_14_characters(self):
        user = self._make_user(bond="student", enrollment="1234567899999")

        with self.assertRaises(ValidationError):
            user.save()

    def test_cpf_must_be_valid(self):
        user = self._make_user(cpf="12345678911")

        with self.assertRaises(ValidationError):
            user.save()

    def test_accepts_marketing_contact_defaults_to_true(self):
        user = self._make_user(email="marketing@example.com", cpf="39581481079")
        user.save()

        saved_user = User.objects.get(pk=user.pk)
        self.assertTrue(saved_user.accepts_marketing_contact)

    def test_db_table_name(self):
        self.assertEqual(User._meta.db_table, "users")
