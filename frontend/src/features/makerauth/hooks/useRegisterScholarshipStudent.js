import { useState } from 'react';
import { authService } from '../services/authService';
import { extractServerErrors } from '@/lib/apiErrors';

export function useRegisterScholarshipStudent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const register = async (formValues) => {
    setIsSubmitting(true);
    setServerErrors({});

    const { passwordConfirmation, ...payload } = formValues;

    try {
      // Backend forces bond='student' and is_active=False (UserService.create_user_without_group):
      // the account stays pending until an Owner/Manager calls the accept action.
      await authService.registerScholarshipStudent(payload);
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