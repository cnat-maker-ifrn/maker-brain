from django.test import TestCase
from django.db import IntegrityError
from app.models import User


class UserModelTest(TestCase):

    def _make_user(self, **kwargs):
        defaults = dict(
            auth_id=1,
            cpf="12345678901",
            email="user@example.com",
            name="Test User",
            cellphone="84999999999",
            bond="student",
        )
        defaults.update(kwargs)
        return User(**defaults)

    def test_create_user_with_required_fields(self):
        user = self._make_user()
        user.save()
        self.assertEqual(User.objects.count(), 1)

    def test_user_str_representation(self):
        user = self._make_user()
        str(user)

    def test_auth_id_is_unique(self):
        self._make_user(auth_id=10, cpf="11111111111", email="a@a.com").save()
        with self.assertRaises(IntegrityError):
            self._make_user(auth_id=10, cpf="22222222222", email="b@b.com").save()

    def test_cpf_is_unique(self):
        self._make_user(auth_id=1, cpf="00000000001", email="a@a.com").save()
        with self.assertRaises(IntegrityError):
            self._make_user(auth_id=2, cpf="00000000001", email="b@b.com").save()

    def test_email_is_unique(self):
        self._make_user(auth_id=1, cpf="00000000001", email="dup@dup.com").save()
        with self.assertRaises(IntegrityError):
            self._make_user(auth_id=2, cpf="00000000002", email="dup@dup.com").save()

    def test_enrollment_is_optional(self):
        user = self._make_user(enrollment=None)
        user.save()
        self.assertIsNone(User.objects.get(pk=user.pk).enrollment)

    def test_groups_defaults_to_empty_list(self):
        user = self._make_user()
        user.save()
        self.assertEqual(User.objects.get(pk=user.pk).groups, [])

    def test_groups_stores_list(self):
        user = self._make_user(groups=["bolsista", "gerente"])
        user.save()
        self.assertEqual(User.objects.get(pk=user.pk).groups, ["bolsista", "gerente"])

    def test_is_active_defaults_to_true(self):
        user = self._make_user()
        user.save()
        self.assertTrue(User.objects.get(pk=user.pk).is_active)

    def test_db_table_name(self):
        self.assertEqual(User._meta.db_table, "users")