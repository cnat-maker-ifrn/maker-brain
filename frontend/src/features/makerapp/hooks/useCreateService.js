import { useState } from 'react';
import { serviceService } from '../services/serviceService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useCreateService() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const createService = async (payload) => {
    setIsSubmitting(true);
    setServerErrors({});
    try {
      await serviceService.create(payload);
      setIsSuccess(true);
      return true;
    } catch (error) {
      setServerErrors(extractServerErrors(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createService, isSubmitting, serverErrors, isSuccess };
}