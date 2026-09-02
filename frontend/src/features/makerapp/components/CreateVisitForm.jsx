import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SlotPicker } from './SlotPicker';
import { useCreateVisit } from '../hooks/useCreateVisit';
import { schoolService } from '../services/schoolService';
import { companyService } from '../services/companyService';
import { VISIT_CONSTRAINTS } from '@/frontLib/visitAvailability';

const VISIT_TYPE_OPTIONS = [
  { value: 'fast', label: 'Rápida (até 20 min)' },
  { value: 'childish', label: 'Infantil (até 30 min)' },
  { value: 'technical', label: 'Técnica (até 30 min)' },
];

const REQUESTER_ORIGIN_OPTIONS = [
  { value: 'cnat', label: 'CNAT' },
  { value: 'school', label: 'Escola' },
  { value: 'company', label: 'Empresa' },
  { value: 'external', label: 'Externo' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'diatinf', label: 'DIATINF' },
  { value: 'diaren', label: 'DIAREN' },
  { value: 'diacon', label: 'DIACON' },
  { value: 'diacin', label: 'DIACIN' },
  { value: 'diac', label: 'DIAC' },
];

const INITIAL_VALUES = {
  visit_type: 'fast',
  requester_origin: 'external',
  cnat_department: '',
  school: '',
  company: '',
  forecast_number_of_visitors: '',
  description: '',
};

export function CreateVisitForm({ onCreated }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [schedulingDate, setSchedulingDate] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [schools, setSchools] = useState([]);
  const [companies, setCompanies] = useState([]);
  const { createVisit, isSubmitting, serverErrors, isSuccess } = useCreateVisit();

  const errors = { ...fieldErrors, ...serverErrors };
  const maxVisitors = VISIT_CONSTRAINTS[values.visit_type]?.maxVisitors;

  useEffect(() => {
    if (values.requester_origin === 'school' && schools.length === 0) {
      schoolService.list().then(({ data }) => setSchools(data)).catch(() => {});
    }
    if (values.requester_origin === 'company' && companies.length === 0) {
      companyService.list().then(({ data }) => setCompanies(data)).catch(() => {});
    }
  }, [values.requester_origin]);

  const setField = (field) => (event) => {
    const raw = event.target.value;
    setValues((prev) => ({ ...prev, [field]: raw }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!schedulingDate) nextErrors.scheduling_date = 'Escolha um dia e horário.';
    if (!values.forecast_number_of_visitors) {
      nextErrors.forecast_number_of_visitors = 'Informe o número previsto de visitantes.';
    } else if (Number(values.forecast_number_of_visitors) > maxVisitors) {
      nextErrors.forecast_number_of_visitors = `Máximo de ${maxVisitors} visitantes para esse tipo de visita.`;
    }
    if (values.requester_origin === 'school' && !values.school) {
      nextErrors.school = 'Selecione a escola.';
    }
    if (values.requester_origin === 'company' && !values.company) {
      nextErrors.company = 'Selecione a empresa.';
    }
    if (values.requester_origin === 'cnat' && !values.cnat_department) {
      nextErrors.cnat_department = 'Selecione o departamento.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      visit_type: values.visit_type,
      scheduling_date: schedulingDate.toISOString(),
      forecast_number_of_visitors: Number(values.forecast_number_of_visitors),
      requester_origin: values.requester_origin,
      description: values.description || null,
      cnat_department: values.requester_origin === 'cnat' ? values.cnat_department : null,
      school: values.requester_origin === 'school' ? values.school : null,
      company: values.requester_origin === 'company' ? values.company : null,
    };

    const succeeded = await createVisit(payload);
    if (succeeded) onCreated?.();
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-forest-200 bg-forest-50 px-6 py-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">Visita solicitada</p>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">Aguardando aprovação</h2>
        <p className="mt-2 text-sm text-gray-500">
          Você será avisado quando sua visita for aceita ou rejeitada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {errors.non_field_errors ? (
        <p className="rounded-md border border-danger-100 bg-danger-50 px-4 py-2.5 text-sm text-danger-600">
          {errors.non_field_errors}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="visit_type"
          label="Tipo de visita"
          placeholder="Selecione o tipo"
          options={VISIT_TYPE_OPTIONS}
          value={values.visit_type}
          onChange={setField('visit_type')}
          error={errors.visit_type}
        />
        <Input
          id="forecast_number_of_visitors"
          type="number"
          label={`Nº de visitantes (máx. ${maxVisitors})`}
          value={values.forecast_number_of_visitors}
          onChange={setField('forecast_number_of_visitors')}
          error={errors.forecast_number_of_visitors}
          min={1}
          max={maxVisitors}
        />
      </div>

      <Select
        id="requester_origin"
        label="Origem da solicitação"
        placeholder="Selecione a origem"
        options={REQUESTER_ORIGIN_OPTIONS}
        value={values.requester_origin}
        onChange={setField('requester_origin')}
        error={errors.requester_origin}
      />

      {values.requester_origin === 'cnat' && (
        <Select
          id="cnat_department"
          label="Departamento"
          placeholder="Selecione o departamento"
          options={DEPARTMENT_OPTIONS}
          value={values.cnat_department}
          onChange={setField('cnat_department')}
          error={errors.cnat_department}
        />
      )}

      {values.requester_origin === 'school' && (
        <Select
          id="school"
          label="Escola"
          placeholder="Selecione a escola"
          options={schools.map((school) => ({ value: school.id, label: school.name }))}
          value={values.school}
          onChange={setField('school')}
          error={errors.school}
        />
      )}

      {values.requester_origin === 'company' && (
        <Select
          id="company"
          label="Empresa"
          placeholder="Selecione a empresa"
          options={companies.map((company) => ({ value: company.id, label: company.name }))}
          value={values.company}
          onChange={setField('company')}
          error={errors.company}
        />
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Dia e horário</p>
        <SlotPicker visitType={values.visit_type} value={schedulingDate} onChange={setSchedulingDate} />
        {errors.scheduling_date ? (
          <span className="mt-1 block text-xs text-danger-600">{errors.scheduling_date}</span>
        ) : null}
      </div>

      <Input
        id="description"
        label="Descrição (opcional)"
        value={values.description}
        onChange={setField('description')}
        error={errors.description}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Solicitar visita
      </Button>
    </form>
  );
}