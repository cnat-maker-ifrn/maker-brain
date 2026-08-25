import { useState } from 'react';
import { scholarshipStudentService } from '../services/scholarshipStudentService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useScholarshipStudentActions(onActionComplete) {
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const accept = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await scholarshipStudentService.accept(id);
      onActionComplete?.();
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await scholarshipStudentService.reject(id);
      onActionComplete?.();
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setProcessingId(null);
    }
  };

  return { accept, reject, processingId, error };
}