import { useState, useEffect, useCallback } from 'react';
import { visitService } from '../services/visitService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useVisitManagement() {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await visitService.listAll();
      setVisits(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const accept = async (id) => {
    setProcessingId(id);
    try {
      await visitService.accept(id);
      await fetchVisits();
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    setProcessingId(id);
    try {
      await visitService.reject(id);
      await fetchVisits();
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setProcessingId(null);
    }
  };

  return { visits, isLoading, error, processingId, accept, reject, refetch: fetchVisits };
}