import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { maskCellphone, unmask } from '@/frontLib/masks';
import { validateProfileForm } from '@/frontLib/validators';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext';
import { extractServerErrors } from '@/frontLib/apiErrors';

function EditProfileForm({ onClose, profile, onUpdated }) {
  const { updateUser } = useAuth();
  const [values, setValues] = useState(() => ({
    name: profile?.name || '',
    cellphone: profile?.cellphone ? maskCellphone(profile.cellphone) : '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  }));
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = { ...fieldErrors, ...serverErrors };

  const handleChange = (field) => (event) => {
    const raw = event.target.value;
    const nextValue = field === 'cellphone' ? maskCellphone(raw) : raw;

    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleChangePassword = () => {
    setIsChangingPassword((prev) => {
      const next = !prev;
      if (!next) {
        setValues((v) => ({ ...v, current_password: '', new_password: '', confirm_password: '' }));
        setFieldErrors((e) => ({
          ...e,
          current_password: undefined,
          new_password: undefined,
          confirm_password: undefined,
        }));
        setServerErrors((e) => ({
          ...e,
          current_password: undefined,
          new_password: undefined,
        }));
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProfileForm(values, { checkPassword: isChangingPassword });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors({});

    try {
      const payload = {
        name: values.name.trim(),
        cellphone: unmask(values.cellphone),
      };

      if (isChangingPassword) {
        payload.current_password = values.current_password;
        payload.new_password = values.new_password;
      }

      const updated = await authService.updateProfile(payload);
      if (updateUser) {
        updateUser({ name: updated.name });
      }
      onUpdated?.(updated, isChangingPassword);
      onClose();
    } catch (err) {
      setServerErrors(extractServerErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="mb-4 sm:mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">
              Meu Perfil
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
              Editar Perfil
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-forest-500"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {errors.non_field_errors && (
          <div className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger-600 border border-danger-100">
            {errors.non_field_errors}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Nome completo"
            value={values.name}
            onChange={handleChange('name')}
            error={errors.name}
            placeholder="Seu nome completo"
            required
          />

          <Input
            id="cellphone"
            label="Telefone / Celular"
            value={values.cellphone}
            onChange={handleChange('cellphone')}
            error={errors.cellphone}
            placeholder="(84) 99999-9999"
            required
          />

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={toggleChangePassword}
              className="flex items-center justify-between w-full rounded-lg bg-gray-50 hover:bg-gray-100/80 px-3.5 py-2.5 text-left transition-colors border border-gray-200/80 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-gray-200 text-forest-600 shadow-2xs group-hover:text-forest-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Alterar senha</p>
                  <p className="text-xs text-gray-500">Defina uma nova senha para sua conta</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                isChangingPassword
                  ? 'bg-danger-50 text-danger-700 hover:bg-danger-100'
                  : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
              }`}>
                {isChangingPassword ? 'Cancelar' : 'Alterar'}
              </span>
            </button>

            {isChangingPassword && (
              <div className="mt-3.5 space-y-3.5 rounded-lg bg-gray-50/60 p-3.5 sm:p-4 border border-gray-200/70">
                <Input
                  id="current_password"
                  type="password"
                  label="Senha atual"
                  value={values.current_password}
                  onChange={handleChange('current_password')}
                  error={errors.current_password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <Input
                  id="new_password"
                  type="password"
                  label="Nova senha"
                  value={values.new_password}
                  onChange={handleChange('new_password')}
                  error={errors.new_password}
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  hint="A nova senha deve ter no mínimo 8 caracteres."
                  required
                />

                <Input
                  id="confirm_password"
                  type="password"
                  label="Confirmar nova senha"
                  value={values.confirm_password}
                  onChange={handleChange('confirm_password')}
                  error={errors.confirm_password}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 text-center"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditProfileModal({ isOpen, onClose, profile, onUpdated }) {
  if (!isOpen) return null;
  return <EditProfileForm onClose={onClose} profile={profile} onUpdated={onUpdated} />;
}
