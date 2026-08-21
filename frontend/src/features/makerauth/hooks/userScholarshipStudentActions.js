import { useState } from 'react';
import { scholarshipStudentService } from '../services/scholarshipStudentService';
import { parseApiError } from '@/frontLib/apiErrors';

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
      setError(parseApiError(err));
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
      setError(parseApiError(err));
    } finally {
      setProcessingId(null);
    }
  };

  return { accept, reject, processingId, error };
}