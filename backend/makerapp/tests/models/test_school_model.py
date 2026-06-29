from django.test import TestCase
from app.models import School


class SchoolModelTest(TestCase):

    def _make_school(self, **kwargs):
        defaults = dict(
            name="Escola Estadual Teste",
            school_type="public",
            city="Natal",
            state="RN",
        )
        defaults.update(kwargs)
        return School(**defaults)

    def test_create_public_school(self):
        school = self._make_school(school_type="public")
        school.save()
        self.assertEqual(School.objects.count(), 1)

    def test_create_private_school(self):
        school = self._make_school(school_type="private")
        school.save()
        self.assertEqual(School.objects.get(pk=school.pk).school_type, "private")

    def test_city_and_state_are_optional(self):
        school = self._make_school(city="", state="")
        school.save()
        saved = School.objects.get(pk=school.pk)
        self.assertEqual(saved.city, "")
        self.assertEqual(saved.state, "")

    def test_school_type_choices(self):
        valid_types = [c[0] for c in School.SCHOOL_TYPE_CHOICES]
        self.assertIn("public", valid_types)
        self.assertIn("private", valid_types)

    def test_db_table_name(self):
        self.assertEqual(School._meta.db_table, "schools")

    def test_name_max_length(self):
        field = School._meta.get_field("name")
        self.assertEqual(field.max_length, 255)

    def test_state_max_length(self):
        field = School._meta.get_field("state")
        self.assertEqual(field.max_length, 2)