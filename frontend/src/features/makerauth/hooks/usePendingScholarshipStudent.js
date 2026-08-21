import { useState, useEffect, useCallback } from 'react';
import { scholarshipStudentService } from '../services/scholarshipStudentService';
import { parseApiError } from '@/frontLib/apiErrors';

export function usePendingScholarshipStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await scholarshipStudentService.listPending();
      setStudents(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { students, isLoading, error, refetch: fetchPending };
}