import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateService } from '../hooks/useCreateService';

const SERVICE_TYPE_OPTIONS = [
  { value: '3d_printing', label: 'Impressão 3D' },
  { value: 'laser_cutting', label: 'Corte a Laser' },
  { value: 'stamping', label: 'Estampagem' },
];

const ALLOWED_FILE_EXTENSIONS = ['stl', 'obj', 'jpg', 'jpeg', 'png'];

const INITIAL_VALUES = {
  name: '',
  description: '',
  quantity: '',
  file: null,
};

function validateServiceForm(values) {
  const errors = {};

  if (!values.name) errors.name = 'Selecione o tipo de serviço.';
  if (!values.description.trim()) errors.description = 'Descreva o serviço solicitado.';
  if (!values.quantity || Number(values.quantity) <= 0) {
    errors.quantity = 'Informe uma quantidade válida.';
  }
  if (!values.file) {
    errors.file = 'Selecione um arquivo.';
  } else {
    const extension = values.file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      errors.file = `Formatos aceitos: ${ALLOWED_FILE_EXTENSIONS.join(', ')}.`;
    }
  }

  return errors;
}

export function CreateServiceForm({ onCreated }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const { createService, isSubmitting, serverErrors, isSuccess } = useCreateService();

  const errors = { ...fieldErrors, ...serverErrors };

  const setField = (field) => (event) => {
    const raw = event.target.value;
    setValues((prev) => ({ ...prev, [field]: raw }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setFile = (event) => {
    setValues((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }));
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateServiceForm(values);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const succeeded = await createService({
      ...values,
      quantity: Number(values.quantity),
    });

    if (succeeded) onCreated?.();
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-forest-200 bg-forest-50 px-6 py-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">Serviço solicitado</p>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">Solicitação enviada</h2>
        <p className="mt-2 text-sm text-gray-500">
          Você será avisado sobre o andamento da sua solicitação.
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

      <Select
        id="name"
        label="Tipo de serviço"
        placeholder="Selecione o tipo"
        options={SERVICE_TYPE_OPTIONS}
        value={values.name}
        onChange={setField('name')}
        error={errors.name}
      />

      <Input
        id="quantity"
        type="number"
        label="Quantidade"
        value={values.quantity}
        onChange={setField('quantity')}
        error={errors.quantity}
        min={1}
      />

      <Input
        id="description"
        label="Descrição"
        placeholder="Detalhe o que você precisa"
        value={values.description}
        onChange={setField('description')}
        error={errors.description}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium text-gray-700">
          Arquivo (.stl, .obj, .jpg, .jpeg, .png)
        </label>
        <input
          id="file"
          type="file"
          accept=".stl,.obj,.jpg,.jpeg,.png"
          onChange={setFile}
          className="text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0
            file:bg-forest-50 file:px-3.5 file:py-2 file:text-sm file:font-medium
            file:text-forest-700 hover:file:bg-forest-100"
        />
        {errors.file ? <span className="text-xs text-danger-600">{errors.file}</span> : null}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Solicitar serviço
      </Button>
    </form>
  );
}