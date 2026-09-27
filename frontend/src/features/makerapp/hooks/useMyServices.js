import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '../services/serviceService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useMyServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyServices = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const { data } = await serviceService.listMine();
      setServices(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyServices();
  }, [fetchMyServices]);

  return { services, isLoading, error, refetch: fetchMyServices };
}
