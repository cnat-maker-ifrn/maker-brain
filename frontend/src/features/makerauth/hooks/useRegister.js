import { useState } from 'react';
import { authService } from '../services/authService';

function extractServerErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== 'object') {
    return { non_field_errors: 'Não foi possível concluir o cadastro. Tente novamente.' };
  }
  return Object.fromEntries(
    Object.entries(data).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(' ') : String(messages),
    ])
  );
}

export function useRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const register = async (formValues) => {
    setIsSubmitting(true);
    setServerErrors({});

    const { passwordConfirmation, ...payload } = formValues;

    try {
      await authService.registerRequester(payload);
      setIsSuccess(true);
      return true;
    } catch (error) {
      setServerErrors(extractServerErrors(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { register, isSubmitting, serverErrors, isSuccess };
}