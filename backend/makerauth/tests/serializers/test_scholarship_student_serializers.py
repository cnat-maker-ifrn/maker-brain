from unittest.mock import patch

from django.test import TestCase

from authentication.serializers.scholarship_student_serializers import (
    ScholarshipStudentRegisterSerializer,
    ScholarshipStudentUpdateSerializer,
)
from authentication.models import User


class ScholarshipStudentRegisterSerializerTest(TestCase):

    def setUp(self):
        self.valid_data = {
            "cpf": "12345678901",
            "email": "student@example.com",
            "name": "John Student",
            "cellphone": "84999999999",
            "enrollment": "20240000000001",
            "password": "strongpass123",
        }

    def test_should_validate_serializer_with_valid_data(self):
        serializer = ScholarshipStudentRegisterSerializer(data=self.valid_data)

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_enrollment_is_empty(self):
        data = self.valid_data.copy()
        data["enrollment"] = ""

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)
        self.assertEqual(
            serializer.errors["enrollment"][0],
            "Enrollment is required for students"
        )

    def test_should_accept_enrollment_with_14_characters(self):
        data = self.valid_data.copy()
        data["enrollment"] = "12345678901234"

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_enrollment_has_13_characters(self):
        data = self.valid_data.copy()
        data["enrollment"] = "1234567890123"

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)
        self.assertEqual(
            serializer.errors["enrollment"][0],
            "The enrollment of a student must have 14 characters."
        )

    def test_should_raise_error_when_enrollment_has_15_characters(self):
        data = self.valid_data.copy()
        data["enrollment"] = "123456789012345"

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("enrollment", serializer.errors)
        self.assertEqual(
            serializer.errors["enrollment"][0],
            "The enrollment of a student must have 14 characters."
        )

    def test_should_raise_error_when_password_has_less_than_8_characters(self):
        data = self.valid_data.copy()
        data["password"] = "1234567"

        serializer = ScholarshipStudentRegisterSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    @patch(
        "authentication.serializers.scholarship_student_serializers.UserService.create_user_without_group"
    )
    def test_should_call_create_user_without_group_service(
        self,
        mock_create_user_without_group,
    ):
        serializer = ScholarshipStudentRegisterSerializer(
            data=self.valid_data
        )

        self.assertTrue(serializer.is_valid())

        serializer.save()

        mock_create_user_without_group.assert_called_once_with(
            **serializer.validated_data
        )


class ScholarshipStudentUpdateSerializerTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            cpf="12345678901",
            email="student@example.com",
            name="John Student",
            cellphone="84999999999",
            bond="student",
            enrollment="20240000000001",
            password="oldpassword123",
        )

        self.valid_data = {
            "email": "updated@example.com",
            "name": "Updated Student",
            "cellphone": "84888888888",
            "password": "newpassword123",
        }

    def test_should_validate_serializer_with_valid_data(self):
        serializer = ScholarshipStudentUpdateSerializer(
            instance=self.user,
            data=self.valid_data,
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

    def test_should_raise_error_when_password_has_less_than_8_characters(self):
        data = self.valid_data.copy()
        data["password"] = "1234567"

        serializer = ScholarshipStudentUpdateSerializer(
            instance=self.user,
            data=data,
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_should_update_user_data_successfully(self):
        serializer = ScholarshipStudentUpdateSerializer(
            instance=self.user,
            data=self.valid_data,
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertEqual(updated_user.email, self.valid_data["email"])
        self.assertEqual(updated_user.name, self.valid_data["name"])
        self.assertEqual(
            updated_user.cellphone,
            self.valid_data["cellphone"]
        )

    def test_should_update_user_password_successfully(self):
        serializer = ScholarshipStudentUpdateSerializer(
            instance=self.user,
            data=self.valid_data,
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertTrue(
            updated_user.check_password(
                self.valid_data["password"]
            )
        )

    def test_should_keep_old_password_when_password_is_not_sent(self):
        old_password_hash = self.user.password

        data = self.valid_data.copy()
        data.pop("password")

        serializer = ScholarshipStudentUpdateSerializer(
            instance=self.user,
            data=data,
            partial=True,
        )

        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertEqual(updated_user.password, old_password_hash)