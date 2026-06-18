from django.test import TestCase
from app.models import User, School, Company, Visit
import datetime


class VisitModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            auth_id=1,
            cpf="12345678901",
            email="requester@example.com",
            name="Requester",
            cellphone="84999999999",
            bond="external",
        )
        self.school = School.objects.create(
            name="Escola Pública Teste",
            school_type="public",
            city="Natal",
            state="RN",
        )
        self.company = Company.objects.create(
            name="Empresa Incubada",
            cnpj="11222333000181",
            is_incubated=True,
        )
        self.scheduling_date = datetime.datetime(2024, 6, 15, 9, 0, 0, tzinfo=datetime.timezone.utc)

    def _make_visit(self, **kwargs):
        defaults = dict(
            visit_type="fast",
            scheduling_date=self.scheduling_date,
            forecast_number_of_visitors=20,
            requester_origin="external",
            requester=self.user,
        )
        defaults.update(kwargs)
        return Visit(**defaults)

    def test_create_fast_visit(self):
        visit = self._make_visit(visit_type="fast")
        visit.save()
        self.assertEqual(Visit.objects.count(), 1)

    def test_create_technical_visit(self):
        visit = self._make_visit(visit_type="technical")
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).visit_type, "technical")

    def test_create_childish_visit(self):
        visit = self._make_visit(visit_type="childish")
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).visit_type, "childish")

    def test_has_visited_defaults_to_false(self):
        visit = self._make_visit()
        visit.save()
        self.assertFalse(Visit.objects.get(pk=visit.pk).has_visited)

    def test_is_visit_closed_defaults_to_false(self):
        visit = self._make_visit()
        visit.save()
        self.assertFalse(Visit.objects.get(pk=visit.pk).is_visit_closed)

    def test_acceptance_status_defaults_to_pending(self):
        visit = self._make_visit()
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).is_visit_accepted, "pending")

    def test_real_number_of_visitors_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).real_number_of_visitors)

    def test_photo_is_optional(self):
        visit = self._make_visit()
        visit.save()
        saved = Visit.objects.get(pk=visit.pk)
        self.assertFalse(bool(saved.photo))

    def test_observations_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).observations)

    def test_description_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).description)

    def test_requester_is_optional(self):
        visit = self._make_visit(requester=None)
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).requester)

    def test_cnat_department_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).cnat_department)

    def test_school_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).school)

    def test_company_is_optional(self):
        visit = self._make_visit()
        visit.save()
        self.assertIsNone(Visit.objects.get(pk=visit.pk).company)

    def test_visit_linked_to_school(self):
        visit = self._make_visit(requester_origin="school", school=self.school)
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).school, self.school)

    def test_visit_linked_to_company(self):
        visit = self._make_visit(requester_origin="company", company=self.company)
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).company, self.company)

    def test_visit_linked_to_cnat_department(self):
        visit = self._make_visit(requester_origin="cnat", cnat_department="diatinf")
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).cnat_department, "diatinf")

    def test_visit_requester_protect_on_delete(self):
        visit = self._make_visit()
        visit.save()
        with self.assertRaises(Exception):
            self.user.delete()

    def test_visit_school_protect_on_delete(self):
        visit = self._make_visit(requester_origin="school", school=self.school)
        visit.save()
        with self.assertRaises(Exception):
            self.school.delete()

    def test_visit_company_protect_on_delete(self):
        visit = self._make_visit(requester_origin="company", company=self.company)
        visit.save()
        with self.assertRaises(Exception):
            self.company.delete()

    def test_visit_type_choices(self):
        valid = [c[0] for c in Visit.VISIT_TYPE_CHOICES]
        self.assertCountEqual(valid, ["fast", "childish", "technical"])

    def test_acceptance_status_choices(self):
        valid = [c[0] for c in Visit.ACCEPTANCE_STATUS_CHOICES]
        self.assertCountEqual(valid, ["pending", "accepted", "rejected"])

    def test_requester_origin_choices(self):
        valid = [c[0] for c in Visit.REQUESTER_ORIGIN_CHOICES]
        self.assertCountEqual(valid, ["cnat", "school", "company", "external"])

    def test_department_choices(self):
        valid = [c[0] for c in Visit.DEPARTMENT_CHOICES]
        self.assertCountEqual(valid, ["diatinf", "diaren", "diacon", "diacin", "diac"])

    def test_visit_can_be_accepted(self):
        visit = self._make_visit()
        visit.save()
        visit.is_visit_accepted = "accepted"
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).is_visit_accepted, "accepted")

    def test_visit_can_be_rejected(self):
        visit = self._make_visit()
        visit.save()
        visit.is_visit_accepted = "rejected"
        visit.save()
        self.assertEqual(Visit.objects.get(pk=visit.pk).is_visit_accepted, "rejected")

    def test_visit_is_not_closed_without_photo_description_observations(self):
        visit = self._make_visit()
        visit.save()
        saved = Visit.objects.get(pk=visit.pk)
        is_complete = bool(saved.photo) and bool(saved.description) and bool(saved.observations)
        self.assertFalse(is_complete)

    def test_visit_fields_for_closure_are_present(self):
        visit = self._make_visit(
            description="Visita técnica realizada com sucesso.",
            observations="Sem intercorrências.",
        )
        visit.save()
        saved = Visit.objects.get(pk=visit.pk)
        is_complete = bool(saved.photo) and bool(saved.description) and bool(saved.observations)
        self.assertFalse(is_complete)

    def test_db_table_name(self):
        self.assertEqual(Visit._meta.db_table, "visits")