import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { maskCPF, maskCellphone, unmask } from '@/lib/masks';
import { isValidCPF, isValidEmail } from '@/lib/validators';
import { useRegisterScholarshipStudent } from '../hooks/useRegisterScholarshipStudent';

const INITIAL_VALUES = {
  cpf: '',
  email: '',
  name: '',
  cellphone: '',
  enrollment: '',
  profile_picture: null,
  password: '',
  passwordConfirmation: '',
};

function validateScholarshipForm(values) {
  const errors = {};

  if (!isValidCPF(values.cpf)) errors.cpf = 'Informe um CPF válido.';
  if (!isValidEmail(values.email)) errors.email = 'Informe um e-mail válido.';
  if (!values.name.trim()) errors.name = 'Informe seu nome completo.';
  if (values.cellphone.replace(/\D/g, '').length < 10) errors.cellphone = 'Informe um telefone válido.';
  if (!values.enrollment) {
    errors.enrollment = 'Matrícula é obrigatória.';
  } else if (values.enrollment.length !== 14) {
    errors.enrollment = 'A matrícula de estudante deve ter 14 caracteres.';
  }
  if (values.password.length < 8) errors.password = 'A senha deve ter no mínimo 8 caracteres.';
  if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = 'As senhas não conferem.';
  }

  return errors;
}

export function ScholarshipStudentRegisterForm({ onRegistered }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, isSubmitting, serverErrors, isSuccess } = useRegisterScholarshipStudent();

  const errors = { ...fieldErrors, ...serverErrors };

  const setField = (field) => (event) => {
    const raw = event.target.value;
    const nextValue = field === 'cpf' ? maskCPF(raw) : field === 'cellphone' ? maskCellphone(raw) : raw;

    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setFile = (event) => {
    setValues((prev) => ({ ...prev, profile_picture: event.target.files?.[0] ?? null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateScholarshipForm(values);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // No `bond` field here: the backend forces bond='student' for this flow.
    const succeeded = await register({
      ...values,
      cpf: unmask(values.cpf),
      cellphone: unmask(values.cellphone),
    });

    if (succeeded) onRegistered?.();
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
          Cadastro enviado
        </p>
        <h2 className="mt-2 text-xl font-semibold text-stone-100">Aguardando aprovação</h2>
        <p className="mt-2 text-sm text-stone-400">
          Sua conta foi criada e ficará inativa até que um responsável do laboratório aprove seu
          cadastro. Você receberá acesso assim que isso acontecer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {errors.non_field_errors ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {errors.non_field_errors}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-amber-500/80">
          01 — Identificação
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            label="Nome completo"
            placeholder="Ana Beatriz Souza"
            value={values.name}
            onChange={setField('name')}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            id="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            value={values.cpf}
            onChange={setField('cpf')}
            error={errors.cpf}
            inputMode="numeric"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="email"
            type="email"
            label="E-mail"
            placeholder="voce@exemplo.com"
            value={values.email}
            onChange={setField('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="cellphone"
            label="Celular"
            placeholder="(84) 90000-0000"
            value={values.cellphone}
            onChange={setField('cellphone')}
            error={errors.cellphone}
            inputMode="numeric"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-amber-500/80">
          02 — Vínculo com o MakerLab
        </legend>
        <Input
          id="enrollment"
          label="Matrícula"
          placeholder="00000000000000"
          value={values.enrollment}
          onChange={setField('enrollment')}
          error={errors.enrollment}
          hint="A matrícula de estudante tem 14 caracteres."
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile_picture" className="text-sm font-medium tracking-wide text-stone-300">
            Foto de perfil <span className="text-stone-500">(opcional)</span>
          </label>
          <input
            id="profile_picture"
            type="file"
            accept="image/*"
            onChange={setFile}
            className="text-sm text-stone-400 file:mr-3 file:rounded-md file:border-0
              file:bg-stone-800 file:px-3.5 file:py-2 file:text-sm file:font-medium
              file:text-stone-200 hover:file:bg-stone-700"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-amber-500/80">
          03 — Acesso
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="password"
            type="password"
            label="Senha"
            placeholder="Mínimo de 8 caracteres"
            value={values.password}
            onChange={setField('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            id="passwordConfirmation"
            type="password"
            label="Confirmar senha"
            placeholder="Repita a senha"
            value={values.passwordConfirmation}
            onChange={setField('passwordConfirmation')}
            error={errors.passwordConfirmation}
            autoComplete="new-password"
          />
        </div>
      </fieldset>

      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Enviar cadastro
      </Button>
    </form>
  );
}