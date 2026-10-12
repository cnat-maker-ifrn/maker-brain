from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta, datetime
from makerapp.models import ScheduleBlock
from makerauth.models import User


class ScheduleBlockModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            cpf="52998224725",
            email="owner@example.com",
            name="Owner User",
            cellphone="84999999999",
            bond="public_servant",
            password="password123",
        )
        self.now = timezone.now()

    def test_create_schedule_block_all_day(self):
        start = self.now
        end = self.now + timedelta(days=1)
        block = ScheduleBlock.objects.create(
            start_datetime=start,
            end_datetime=end,
            all_day=True,
            reason="Feriado",
            created_by=self.user,
        )
        self.assertEqual(ScheduleBlock.objects.count(), 1)
        self.assertTrue(block.all_day)
        self.assertEqual(block.reason, "Feriado")
        self.assertEqual(block.created_by, self.user)
        self.assertIn("Feriado", str(block))

    def test_create_schedule_block_partial_day(self):
        start = self.now
        end = self.now + timedelta(hours=4)
        block = ScheduleBlock.objects.create(
            start_datetime=start,
            end_datetime=end,
            all_day=False,
            reason="Manutenção matutina",
            created_by=self.user,
        )
        self.assertFalse(block.all_day)
        self.assertEqual(block.reason, "Manutenção matutina")

    def test_validation_error_when_end_before_or_equal_start(self):
        start = self.now
        end = self.now - timedelta(hours=1)
        block = ScheduleBlock(
            start_datetime=start,
            end_datetime=end,
            all_day=True,
        )
        with self.assertRaises(ValidationError):
            block.save()

        # Equal start and end
        block.end_datetime = start
        with self.assertRaises(ValidationError):
            block.save()
