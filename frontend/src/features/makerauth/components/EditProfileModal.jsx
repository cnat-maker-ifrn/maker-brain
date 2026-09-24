import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { maskCellphone, unmask } from '@/frontLib/masks';
import { validateProfileForm } from '@/frontLib/validators';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function EditProfileModal({ isOpen, onClose, profile, onUpdated }) {
  const { updateUser } = useAuth();
  const [values, setValues] = useState({
    name: '',
    cellphone: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setValues({
        name: profile.name || '',
        cellphone: profile.cellphone ? maskCellphone(profile.cellphone) : '',
      });
      setFieldErrors({});
      setServerErrors({});
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const errors = { ...fieldErrors, ...serverErrors };

  const handleChange = (field) => (event) => {
    const raw = event.target.value;
    const nextValue = field === 'cellphone' ? maskCellphone(raw) : raw;

    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProfileForm(values);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors({});

    try {
      const payload = {
        name: values.name.trim(),
        cellphone: unmask(values.cellphone),
      };

      const updated = await authService.updateProfile(payload);
      if (updateUser) {
        updateUser({ name: updated.name });
      }
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      setServerErrors(extractServerErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-forest-600">
              Meu Perfil
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              Editar Perfil
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={isSubmitting}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
