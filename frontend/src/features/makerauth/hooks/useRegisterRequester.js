import { useState } from 'react';
import { authService } from '../services/authService';
import { extractServerErrors } from '@/lib/apiErrors';

export function useRegisterRequester() {
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