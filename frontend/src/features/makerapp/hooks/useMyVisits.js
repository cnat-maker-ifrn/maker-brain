import { useState, useEffect, useCallback } from 'react';
import { visitService } from '../services/visitService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useMyVisits() {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await visitService.listMine();
      setVisits(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyVisits();
  }, [fetchMyVisits]);

  return { visits, isLoading, error, refetch: fetchMyVisits };
}