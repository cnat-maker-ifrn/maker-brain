from django.test import TestCase
from django.db import IntegrityError
from app.models import Company


class CompanyModelTest(TestCase):

    def _make_company(self, **kwargs):
        defaults = dict(
            name="Empresa Teste LTDA",
            cnpj="12345678000195",
            is_incubated=False,
        )
        defaults.update(kwargs)
        return Company(**defaults)

    def test_create_company(self):
        company = self._make_company()
        company.save()
        self.assertEqual(Company.objects.count(), 1)

    def test_cnpj_is_unique(self):
        self._make_company(cnpj="12345678000195").save()
        with self.assertRaises(IntegrityError):
            self._make_company(name="Outra Empresa", cnpj="12345678000195").save()

    def test_cnpj_is_optional(self):
        company = self._make_company(cnpj=None)
        company.save()
        self.assertIsNone(Company.objects.get(pk=company.pk).cnpj)

    def test_is_incubated_defaults_to_false(self):
        company = self._make_company(cnpj=None)
        company.save()
        self.assertFalse(Company.objects.get(pk=company.pk).is_incubated)

    def test_is_incubated_can_be_true(self):
        company = self._make_company(is_incubated=True)
        company.save()
        self.assertTrue(Company.objects.get(pk=company.pk).is_incubated)

    def test_db_table_name(self):
        self.assertEqual(Company._meta.db_table, "companies")

    def test_name_max_length(self):
        field = Company._meta.get_field("name")
        self.assertEqual(field.max_length, 255)