from django.test import TestCase
from django.core.exceptions import ValidationError
from makerauth.models import User


class UserModelTest(TestCase):

    def setUp(self):
        self.user_data = {
            'cpf': '12345678901',
            'email': 'example@example.com',
            'name': 'Example',
            'cellphone': '84999999999',
            'bond': 'student',
            'enrollment': '20000000000000',
            'password': '123456'
        }

    def test_create_user_successfully(self):
        user = User.objects.create_user(**self.user_data)

        self.assertEqual(user.email, 'example@example.com')
        self.assertEqual(user.name, 'Example')
        self.assertTrue(user.check_password('123456'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser_successfully(self):
        admin = User.objects.create_superuser(
            cpf='11111111111',
            email='admin@example.com',
            name='Admin',
            cellphone='84988888888',
            password='admin123'
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_student_without_enrollment_should_raise_error(self):
        user = User(
            cpf='22222222222',
            email='student@example.com',
            name='Student Test',
            cellphone='84977777777',
            bond='student'
        )

        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_teacher_without_enrollment_should_raise_error(self):
        user = User(
            cpf='33333333333',
            email='teacher@example.com',
            name='Teacher Test',
            cellphone='84966666666',
            bond='teacher'
        )

        with self.assertRaises(ValidationError):
            user.full_clean()

    def test_external_user_without_enrollment_should_be_valid(self):
        user = User.objects.create_user(
            cpf='44444444444',
            email='external@example.com',
            name='External User',
            cellphone='84955555555',
            bond='external',
            password='123456'
        )

        self.assertIsNotNone(user.id)

    def test_email_must_be_unique(self):
        User.objects.create_user(**self.user_data)

        with self.assertRaises(Exception):
            User.objects.create_user(
                cpf='99999999999',
                email='example@example.com',
                name='Another User',
                cellphone='84911111111',
                bond='external',
                password='123456'
            )

    def test_cpf_must_be_unique(self):
        User.objects.create_user(**self.user_data)

        with self.assertRaises(Exception):
            User.objects.create_user(
                cpf='12345678901',
                email='another@example.com',
                name='Another User',
                cellphone='84911111111',
                bond='external',
                password='123456'
            )

    def test_string_representation(self):
        user = User.objects.create_user(**self.user_data)

        self.assertEqual(
            str(user),
            'Example (example@example.com)'
        )

class UserManagerTest(TestCase):

    def test_create_user(self):
        user = User.objects.create_user(
            cpf='12345678901',
            email='TEST@EMAIL.COM',
            name='Example',
            cellphone='84999999999',
            bond='student',
            enrollment='20250010000000',
            password='123456'
        )

        self.assertEqual(user.cpf, '12345678901')
        self.assertEqual(user.email, 'TEST@email.com')
        self.assertEqual(user.name, 'Example')
        self.assertEqual(user.cellphone, '84999999999')
        self.assertEqual(user.bond, 'student')
        self.assertEqual(user.enrollment, '20250010000000')

        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        self.assertTrue(user.check_password('123456'))

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            cpf='11111111111',
            email='admin@email.com',
            name='Admin',
            cellphone='84888888888',
            password='admin123'
        )

        self.assertEqual(admin.bond, 'public_servant')

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

        self.assertTrue(admin.check_password('admin123'))

    def test_create_user_with_extra_fields(self):
        user = User.objects.create_user(
            cpf='22222222222',
            email='extra@email.com',
            name='Extra Fields',
            cellphone='84777777777',
            bond='external',
            password='123456',
            is_staff=True
        )

        self.assertTrue(user.is_staff)

    def test_email_is_normalized(self):
        user = User.objects.create_user(
            cpf='33333333333',
            email='USER@GMAIL.COM',
            name='Normalize',
            cellphone='84666666666',
            bond='external',
            password='123456'
        )

        self.assertEqual(user.email, 'USER@gmail.com')

    def test_password_is_hashed(self):
        user = User.objects.create_user(
            cpf='44444444444',
            email='password@email.com',
            name='Password Test',
            cellphone='84555555555',
            bond='external',
            password='mypassword'
        )

        self.assertNotEqual(user.password, 'mypassword')
        self.assertTrue(user.check_password('mypassword'))

    def test_create_student_with_enrollment_different_of_14(self):
        user = User(
            cpf='12345678911',
            email='student@example.com',
            name='Student Test',
            cellphone='84977777777',
            bond='student',
            enrollment='2000000000000'
        )

        with self.assertRaises(ValidationError) as context:
            user.full_clean()
        
        self.assertIn('The enrollment of a student must have 14 characters', str(context.exception))