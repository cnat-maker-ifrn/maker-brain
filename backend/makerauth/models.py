from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from authentication.validators import validate_cpf


class UserManager(BaseUserManager):
    def create_user(self, cpf, email, name, cellphone, bond, enrollment=None, profile_picture=None, password=None, **extra_fields):

        user = self.model(
            cpf=cpf,
            email=self.normalize_email(email),
            name=name,
            cellphone=cellphone,
            bond=bond,
            enrollment=enrollment,
            profile_picture=profile_picture,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, cpf, email, name, cellphone, bond='public_servant', enrollment=None, profile_picture=None, password=None, **extra_fields):
        user = self.create_user(
            cpf=cpf,
            email=email,
            name=name,
            cellphone=cellphone,
            bond=bond,
            enrollment=enrollment,
            profile_picture=profile_picture,
            password=password,
            is_staff=True,
            is_superuser=True,
            **extra_fields
        )

        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    BOND_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('public_servant', 'Public Servant'),
        ('external', 'External'),
    ]

    cpf = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    cellphone = models.CharField(max_length=20)
    bond = models.CharField(max_length=20, choices=BOND_CHOICES)
    enrollment = models.CharField(unique=True, max_length=20, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cpf', 'name', 'cellphone']

    def clean(self):
        super().clean()
        validate_cpf(self.cpf)
        if not self.enrollment:
            if self.bond == 'student':
                raise ValidationError({'enrollment': 'Enrollment is required for students'})
            elif self.bond == 'teacher':
                raise ValidationError({'enrollment': 'Enrollment is required for teachers'})
        if self.bond == 'student' and len(self.enrollment) != 14:
            raise ValidationError({'enrollment': 'The enrollment of a student must have 14 characters'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        db_table = 'users'
