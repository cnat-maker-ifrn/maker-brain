import { useState } from 'react';
import { visitService } from '../services/visitService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useCreateVisit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const createVisit = async (payload) => {
    setIsSubmitting(true);
    setServerErrors({});
    try {
      await visitService.create(payload);
      setIsSuccess(true);
      return true;
    } catch (error) {
      setServerErrors(extractServerErrors(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createVisit, isSubmitting, serverErrors, isSuccess };
}