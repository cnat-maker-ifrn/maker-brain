from django.test import TestCase

from makerauth.models import User
from makerauth.serializers.requester_serializers import (
    RequesterDetailSerializer,
    RequesterListSerializer,
    RequesterRegisterSerializer,
    RequesterUpdateSerializer,
)
from makerauth.serializers.scholarship_student_serializers import (
    ScholarshipStudentDetailSerializer,
    ScholarshipStudentListSerializer,
    ScholarshipStudentRegisterSerializer,
    ScholarshipStudentUpdateSerializer,
)


class RequesterSerializerTest(TestCase):

    def _make_requester_data(self, **kwargs):
        defaults = dict(
            cpf="52998224725",
            email="requester@example.com",
            name="Requester Teste",
            cellphone="11999999999",
            bond="external",
            password="senha1234",
        )
        defaults.update(kwargs)
        return defaults

    def test_requester_register_requires_enrollment_for_student(self):
        data = self._make_requester_data(bond="student", enrollment="")

        serializer = RequesterRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_requester_register_rejects_student_enrollment_with_invalid_length(self):
        data = self._make_requester_data(bond="student", enrollment="1234")

        serializer = RequesterRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_requester_register_create_creates_user_and_assigns_requester_group(self):
        data = self._make_requester_data(email="requester-create@example.com", cpf="39581481079")

        serializer = RequesterRegisterSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(User.objects.filter(pk=user.pk).exists())
        self.assertTrue(user.groups.filter(name="Requesters").exists())

    def test_requester_update_requires_enrollment_for_student(self):
        data = self._make_requester_data(bond="student", enrollment="")

        serializer = RequesterUpdateSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_requester_detail_serializer_includes_expected_fields(self):
        user = User.objects.create_user(
            cpf="39581481079",
            email="detail@example.com",
            name="Detail User",
            cellphone="11999999998",
            bond="external",
            password="senha1234",
        )

        serializer = RequesterDetailSerializer(user)

        self.assertEqual(serializer.data["email"], user.email)
        self.assertIn("groups", serializer.data)


class ScholarshipStudentSerializerTest(TestCase):

    def _make_student_data(self, **kwargs):
        defaults = dict(
            cpf="39581481079",
            email="student@example.com",
            name="Student Teste",
            cellphone="11999999997",
            enrollment="20240000000123",
            password="senha1234",
        )
        defaults.update(kwargs)
        return defaults

    def test_scholarship_student_register_requires_enrollment(self):
        data = self._make_student_data(enrollment="")

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_scholarship_student_register_rejects_invalid_enrollment_length(self):
        data = self._make_student_data(enrollment="1234")

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_scholarship_student_register_create_creates_inactive_user(self):
        data = self._make_student_data(email="student-create@example.com", cpf="39581481079")

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertFalse(user.is_active)
        self.assertEqual(user.bond, "student")

    def test_scholarship_student_update_changes_password(self):
        user = User.objects.create_user(
            cpf="39581481079",
            email="student-update@example.com",
            name="Student Update",
            cellphone="11999999996",
            bond="student",
            enrollment="20240000000124",
            password="senha1234",
        )

        serializer = ScholarshipStudentUpdateSerializer(instance=user, data={"password": "novaSenha123"}, partial=True)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertTrue(updated_user.check_password("novaSenha123"))

    def test_scholarship_student_list_serializer_includes_expected_fields(self):
        user = User.objects.create_user(
            cpf="39581481079",
            email="student-list@example.com",
            name="Student List",
            cellphone="11999999995",
            bond="student",
            enrollment="20240000000125",
            password="senha1234",
        )

        serializer = ScholarshipStudentListSerializer(user)

        self.assertEqual(serializer.data["email"], user.email)
        self.assertIn("groups", serializer.data)
