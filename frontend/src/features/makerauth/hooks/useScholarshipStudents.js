import { useState, useEffect, useCallback } from 'react';
import { scholarshipStudentService } from '../services/scholarshipStudentService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useScholarshipStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await scholarshipStudentService.list();
      setStudents(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, isLoading, error, refetch: fetchStudents };
}
