from datetime import datetime, timedelta, time
from django.contrib.auth.models import Group
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.exceptions import ValidationError

from makerapp.models import ScheduleBlock, Visit
from makerapp.services import VisitService
from makerauth.models import User


class ScheduleBlockAPITestCase(APITestCase):

    def setUp(self):
        # Groups
        self.owner_group, _ = Group.objects.get_or_create(name="Owners")
        self.manager_group, _ = Group.objects.get_or_create(name="Managers")
        self.scholarship_group, _ = Group.objects.get_or_create(name="Scholarship Students")
        self.requester_group, _ = Group.objects.get_or_create(name="Requesters")

        # Users
        self.owner = User.objects.create_user(
            cpf="11144477735",
            email="owner@maker.com",
            name="Owner User",
            cellphone="84999990001",
            bond="public_servant",
            password="password123",
        )
        self.owner.groups.add(self.owner_group)

        self.manager = User.objects.create_user(
            cpf="22255588846",
            email="manager@maker.com",
            name="Manager User",
            cellphone="84999990002",
            bond="public_servant",
            password="password123",
        )
        self.manager.groups.add(self.manager_group)

        self.scholarship_student = User.objects.create_user(
            cpf="44477711107",
            email="scholarship@maker.com",
            name="Scholarship Student",
            cellphone="84999990004",
            bond="student",
            enrollment="20231014040001",
            password="password123",
        )
        self.scholarship_student.groups.add(self.scholarship_group)

        self.requester = User.objects.create_user(
            cpf="33366699957",
            email="requester@maker.com",
            name="Requester User",
            cellphone="84999990003",
            bond="external",
            password="password123",
        )
        self.requester.groups.add(self.requester_group)

        self.url = "/api/makerapp/schedule-blocks/"


    def test_owner_can_list_schedule_blocks(self):
        self.client.force_authenticate(user=self.owner)
        start = timezone.now() + timedelta(days=5)
        end = start + timedelta(days=1)
        ScheduleBlock.objects.create(
            start_datetime=start,
            end_datetime=end,
            all_day=True,
            reason="Feriado",
            created_by=self.owner,
        )

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['reason'], "Feriado")
        self.assertEqual(response.data[0]['created_by_name'], self.owner.name)

    def test_non_owner_forbidden_from_listing_schedule_blocks(self):
        # Manager without Owner group
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Scholarship Student
        self.client.force_authenticate(user=self.scholarship_student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Regular Requester
        self.client.force_authenticate(user=self.requester)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Unauthenticated
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_create_single_block(self):
        self.client.force_authenticate(user=self.owner)
        start = timezone.now() + timedelta(days=3)
        end = start + timedelta(hours=3)
        payload = {
            "start_datetime": start.isoformat(),
            "end_datetime": end.isoformat(),
            "all_day": False,
            "reason": "Manutenção de impressoras",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ScheduleBlock.objects.count(), 1)
        block = ScheduleBlock.objects.first()
        self.assertEqual(block.reason, "Manutenção de impressoras")
        self.assertEqual(block.created_by, self.owner)
        self.assertFalse(block.all_day)

    def test_owner_create_batch_with_dates_list(self):
        self.client.force_authenticate(user=self.owner)
        payload = {
            "dates": ["2026-11-10", "2026-11-12", "2026-11-15"],
            "all_day": True,
            "reason": "Recesso acadêmico",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(ScheduleBlock.objects.count(), 3)
        for block in ScheduleBlock.objects.all():
            self.assertTrue(block.all_day)
            self.assertEqual(block.reason, "Recesso acadêmico")

    def test_owner_create_batch_with_date_range(self):
        self.client.force_authenticate(user=self.owner)
        payload = {
            "start_date": "2026-12-01",
            "end_date": "2026-12-03",
            "all_day": False,
            "start_time": "14:00",
            "end_time": "18:00",
            "reason": "Manutenção preventiva tarde",
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Dec 1, 2, 3 = 3 days
        self.assertEqual(len(response.data), 3)
        self.assertEqual(ScheduleBlock.objects.count(), 3)
        for block in ScheduleBlock.objects.all():
            self.assertFalse(block.all_day)
            self.assertEqual(block.reason, "Manutenção preventiva tarde")

    def test_owner_create_batch_list_of_objects(self):
        self.client.force_authenticate(user=self.owner)
        start1 = timezone.now() + timedelta(days=4)
        end1 = start1 + timedelta(hours=2)
        start2 = timezone.now() + timedelta(days=5)
        end2 = start2 + timedelta(hours=2)

        payload = [
            {"start_datetime": start1.isoformat(), "end_datetime": end1.isoformat(), "all_day": False, "reason": "R1"},
            {"start_datetime": start2.isoformat(), "end_datetime": end2.isoformat(), "all_day": False, "reason": "R2"},
        ]

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(ScheduleBlock.objects.count(), 2)

    def test_owner_delete_block(self):
        self.client.force_authenticate(user=self.owner)
        block = ScheduleBlock.objects.create(
            start_datetime=timezone.now() + timedelta(days=1),
            end_datetime=timezone.now() + timedelta(days=2),
            all_day=True,
            reason="Para excluir",
            created_by=self.owner,
        )

        response = self.client.delete(f"{self.url}{block.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ScheduleBlock.objects.count(), 0)

    def test_owner_bulk_delete(self):
        self.client.force_authenticate(user=self.owner)
        b1 = ScheduleBlock.objects.create(
            start_datetime=timezone.now() + timedelta(days=1),
            end_datetime=timezone.now() + timedelta(days=2),
            created_by=self.owner,
        )
        b2 = ScheduleBlock.objects.create(
            start_datetime=timezone.now() + timedelta(days=3),
            end_datetime=timezone.now() + timedelta(days=4),
            created_by=self.owner,
        )

        response = self.client.post(f"{self.url}bulk-delete/", {"ids": [b1.id, b2.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted"], 2)
        self.assertEqual(ScheduleBlock.objects.count(), 0)

    def test_busy_slots_includes_schedule_blocks(self):
        target_date_str = "2026-11-20"
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()

        # Create schedule block on target date from 09:00 to 12:00 UTC
        block_start = timezone.make_aware(datetime.combine(target_date, time(9, 0)))
        block_end = timezone.make_aware(datetime.combine(target_date, time(12, 0)))
        ScheduleBlock.objects.create(
            start_datetime=block_start,
            end_datetime=block_end,
            all_day=False,
            reason="Manutenção matutina",
            created_by=self.owner,
        )

        # Authenticate as regular requester to query busy slots
        self.client.force_authenticate(user=self.requester)
        response = self.client.get(f"/api/makerapp/visits/busy-slots/?date={target_date_str}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response.data), 1)
        slot = response.data[0]
        self.assertEqual(slot["reason"], "Manutenção matutina")
        self.assertFalse(slot["all_day"])

    def test_create_visit_fails_when_conflicting_with_schedule_block(self):
        target_date = timezone.now() + timedelta(days=10)
        # Lab is closed from 08:00 to 18:00
        block_start = target_date.replace(hour=8, minute=0, second=0, microsecond=0)
        block_end = target_date.replace(hour=18, minute=0, second=0, microsecond=0)
        ScheduleBlock.objects.create(
            start_datetime=block_start,
            end_datetime=block_end,
            all_day=True,
            reason="Laboratório Fechado para Reforma",
            created_by=self.owner,
        )

        # Requester attempts to book visit at 10:00
        visit_date = target_date.replace(hour=10, minute=0, second=0, microsecond=0)
        with self.assertRaises(ValidationError) as ctx:
            VisitService.create_visit(
                requester=self.requester,
                validated_data={
                    "visit_type": "fast",
                    "scheduling_date": visit_date,
                    "forecast_number_of_visitors": 15,
                    "requester_origin": "external",
                }
            )

        self.assertIn("scheduling_date", ctx.exception.message_dict)
        self.assertIn("Laboratório Fechado para Reforma", ctx.exception.message_dict["scheduling_date"][0])
