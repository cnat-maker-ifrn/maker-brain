import { useState, useEffect, useCallback } from 'react';
import { scholarshipStudentService } from '../services/scholarshipStudentService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useDemotedScholarshipStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDemoted = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await scholarshipStudentService.listDemoted();
      setStudents(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemoted();
  }, [fetchDemoted]);

  return { students, isLoading, error, refetch: fetchDemoted };
}
