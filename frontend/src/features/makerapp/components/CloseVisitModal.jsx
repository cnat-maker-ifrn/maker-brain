import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { visitService } from '../services/visitService';
import { extractServerErrors } from '@/frontLib/apiErrors';

const VISIT_TYPE_LABELS = {
  fast: 'Rápida',
  childish: 'Infantil',
  technical: 'Técnica',
};

function validateCloseVisitForm(values) {
  const errors = {};

  const realVisitors = String(values.real_number_of_visitors ?? '').trim();
  if (!realVisitors) {
    errors.real_number_of_visitors = 'Informe a quantidade real de pessoas.';
  } else {
    const num = Number(realVisitors);
    if (!Number.isInteger(num) || num <= 0) {
      errors.real_number_of_visitors = 'A quantidade real de pessoas deve ser um número maior que zero.';
    }
  }

  if (!values.description || !values.description.trim()) {
    errors.description = 'Informe a descrição da visita.';
  }

  if (!values.observations || !values.observations.trim()) {
    errors.observations = 'Informe as observações sobre a visita.';
  }

  if (!values.photo) {
    errors.photo = 'Selecione uma foto da visita.';
  } else if (!values.photo.type.startsWith('image/')) {
    errors.photo = 'O arquivo selecionado deve ser uma imagem (JPEG, PNG, etc).';
  }

  return errors;
}

export function CloseVisitModal({ isOpen, visit, onClose, onClosed }) {
  const [values, setValues] = useState({
    real_number_of_visitors: '',
    description: '',
    observations: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && visit) {
      setValues({
        real_number_of_visitors: visit.real_number_of_visitors ?? '',
        description: visit.description || '',
        observations: visit.observations || '',
        photo: null,
      });
      setPhotoPreview(null);
      setFieldErrors({});
      setServerErrors({});
    }
  }, [isOpen, visit]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  if (!isOpen || !visit) return null;

  const errors = { ...fieldErrors, ...serverErrors };

  const handleChange = (field) => (event) => {
    const raw = event.target.value;
    setValues((prev) => ({ ...prev, [field]: raw }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setValues((prev) => ({ ...prev, photo: file }));
    setFieldErrors((prev) => ({ ...prev, photo: undefined }));
    setServerErrors((prev) => ({ ...prev, photo: undefined }));

    if (file && file.type.startsWith('image/')) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setValues((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    setFieldErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateCloseVisitForm(values);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors({});

    try {
      const formData = new FormData();
      formData.append('real_number_of_visitors', Number(values.real_number_of_visitors));
      formData.append('description', values.description.trim());
      formData.append('observations', values.observations.trim());
      formData.append('photo', values.photo);
      formData.append('has_visited', 'true');
      formData.append('is_visit_closed', 'true');

      await visitService.close(visit.id, formData);
      onClosed?.();
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
              Finalização de visita
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
              Fechar Visita
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

        {/* Visit Context summary */}
        <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-xs sm:text-sm text-gray-600 space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">
              Tipo: {VISIT_TYPE_LABELS[visit.visit_type] || visit.visit_type}
            </span>
            <span className="text-gray-500">
              Previstos: <strong className="text-gray-700">{visit.forecast_number_of_visitors}</strong>
            </span>
          </div>
          {visit.requester_name && (
            <p className="text-gray-500">
              Solicitante: <span className="text-gray-700 font-medium">{visit.requester_name}</span>
            </p>
          )}
          {visit.school_name && (
            <p className="text-gray-500">
              Escola: <span className="text-gray-700 font-medium">{visit.school_name}</span>
            </p>
          )}
          {visit.company_name && (
            <p className="text-gray-500">
              Empresa: <span className="text-gray-700 font-medium">{visit.company_name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {errors.non_field_errors || errors.detail ? (
            <p className="rounded-md border border-danger-100 bg-danger-50 px-4 py-2.5 text-sm text-danger-600">
              {errors.non_field_errors || errors.detail}
            </p>
          ) : null}

          {/* Quantidade real de pessoas */}
          <Input
            id="real_number_of_visitors"
            label="Quantidade real de pessoas *"
            type="number"
            min="1"
            placeholder="Ex: 15"
            value={values.real_number_of_visitors}
            onChange={handleChange('real_number_of_visitors')}
            error={errors.real_number_of_visitors}
            disabled={isSubmitting}
          />

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="close_description"
              className="text-sm font-medium tracking-wide text-gray-700"
            >
              Descrição <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="close_description"
              rows={3}
              value={values.description}
              onChange={handleChange('description')}
              placeholder="Descreva o que foi realizado durante a visita..."
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900
                placeholder:text-gray-400 outline-none transition-colors
                focus:border-forest-500 focus:ring-1 focus:ring-forest-500/40
                ${errors.description ? 'border-danger-500/70' : 'border-gray-200'}`}
            />
            {errors.description && (
              <span className="text-xs text-danger-600">{errors.description}</span>
            )}
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="close_observations"
              className="text-sm font-medium tracking-wide text-gray-700"
            >
              Observações <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="close_observations"
              rows={3}
              value={values.observations}
              onChange={handleChange('observations')}
              placeholder="Observações sobre a visita (ex: comportamento, imprevistos, destaques)..."
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-base sm:text-sm text-gray-900
                placeholder:text-gray-400 outline-none transition-colors
                focus:border-forest-500 focus:ring-1 focus:ring-forest-500/40
                ${errors.observations ? 'border-danger-500/70' : 'border-gray-200'}`}
            />
            {errors.observations && (
              <span className="text-xs text-danger-600">{errors.observations}</span>
            )}
          </div>

          {/* Foto */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="close_photo"
              className="text-sm font-medium tracking-wide text-gray-700"
            >
              Foto da visita <span className="text-danger-500">*</span>
            </label>

            {photoPreview ? (
              <div className="relative mt-1 flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-2 bg-gray-50">
                <img
                  src={photoPreview}
                  alt="Pré-visualização da visita"
                  className="max-h-48 w-auto rounded-md object-contain"
                />
                <div className="flex items-center justify-between w-full px-2 text-xs text-gray-600">
                  <span className="truncate max-w-[200px]">{values.photo?.name}</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                    className="text-danger-600 hover:text-danger-700 font-medium transition-colors"
                  >
                    Remover foto
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  id="close_photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 cursor-pointer border border-gray-200 rounded-md p-1.5"
                />
              </div>
            )}

            {errors.photo && (
              <span className="text-xs text-danger-600">{errors.photo}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button type="submit" isLoading={isSubmitting}>
              Fechar Visita
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
