from django.test import TestCase
from django.contrib.auth.models import Group
from rest_framework.exceptions import ValidationError
from unittest.mock import patch

from authentication.models import User
from authentication.serializers.requester_serializers import (
    RequesterRegisterSerializer,
    RequesterUpdateSerializer,
)


class RequesterRegisterSerializerTest(TestCase):

    def setUp(self):
        Group.objects.get_or_create(name="Requesters")

        self.valid_data = {
            "cpf": "12345678901",
            "email": "requester@example.com",
            "name": "John Doe",
            "cellphone": "84999999999",
            "bond": "student",
            "enrollment": "20240000000001",
            "password": "strongpass123",
        }

    def test_should_validate_serializer_with_valid_data(self):
        serializer = RequesterRegisterSerializer(data=self.valid_data)

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_has_no_enrollment(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = ""

        serializer = RequesterRegisterSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_raise_error_when_teacher_has_no_enrollment(self):
        invalid_data = self.valid_data.copy()
        invalid_data["bond"] = "teacher"
        invalid_data["enrollment"] = ""

        serializer = RequesterRegisterSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_validate_external_user_without_enrollment(self):
        valid_data = self.valid_data.copy()
        valid_data["bond"] = "external"
        valid_data["enrollment"] = ""

        serializer = RequesterRegisterSerializer(data=valid_data)

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_enrollment_has_13_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = "1234567890123"

        serializer = RequesterRegisterSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_validate_student_enrollment_with_14_characters(self):
        valid_data = self.valid_data.copy()
        valid_data["enrollment"] = "12345678901234"

        serializer = RequesterRegisterSerializer(data=valid_data)

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_enrollment_has_15_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = "123456789012345"

        serializer = RequesterRegisterSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_raise_error_when_password_has_less_than_8_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["password"] = "1234567"

        serializer = RequesterRegisterSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    @patch("authentication.serializers.requester_serializers.UserService.create_requester")
    def test_should_call_create_requester_service(self, mocked_create_requester):
        serializer = RequesterRegisterSerializer(data=self.valid_data)

        self.assertTrue(serializer.is_valid())

        serializer.save()

        mocked_create_requester.assert_called_once_with(**self.valid_data)


class RequesterUpdateSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            cpf="12345678901",
            email="requester@example.com",
            name="John Doe",
            cellphone="84999999999",
            bond="student",
            enrollment="12345678901234",
            password="strongpass123",
        )

        self.valid_data = {
            "email": "updated@example.com",
            "name": "Updated Name",
            "cellphone": "84888888888",
            "bond": "student",
            "enrollment": "12345678901234",
            "password": "newstrongpass",
        }

    def test_should_validate_serializer_with_valid_data(self):
        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=self.valid_data
        )

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_has_no_enrollment(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = ""

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=invalid_data
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_validate_external_user_without_enrollment(self):
        valid_data = self.valid_data.copy()
        valid_data["bond"] = "external"
        valid_data["enrollment"] = ""

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=valid_data
        )

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_enrollment_has_13_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = "1234567890123"

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=invalid_data
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_validate_student_enrollment_with_14_characters(self):
        valid_data = self.valid_data.copy()
        valid_data["enrollment"] = "12345678901234"

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=valid_data
        )

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_student_enrollment_has_15_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["enrollment"] = "123456789012345"

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=invalid_data
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)

    def test_should_raise_error_when_password_has_less_than_8_characters(self):
        invalid_data = self.valid_data.copy()
        invalid_data["password"] = "1234567"

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=invalid_data
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_should_validate_serializer_without_password(self):
        valid_data = self.valid_data.copy()
        valid_data.pop("password")

        serializer = RequesterUpdateSerializer(
            instance=self.user,
            data=valid_data,
            partial=True
        )

        self.assertTrue(serializer.is_valid())