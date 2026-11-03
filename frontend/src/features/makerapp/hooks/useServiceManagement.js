import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '../services/serviceService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useServiceManagement() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await serviceService.listAll();
      setServices(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const accept = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await serviceService.accept(id);
      await fetchServices();
    } catch (err) {
      const serverErr = extractServerErrors(err);
      setError(serverErr);
      throw serverErr;
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await serviceService.reject(id);
      await fetchServices();
    } catch (err) {
      const serverErr = extractServerErrors(err);
      setError(serverErr);
      throw serverErr;
    } finally {
      setProcessingId(null);
    }
  };

  const complete = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await serviceService.complete(id);
      await fetchServices();
      return true;
    } catch (err) {
      const serverErr = extractServerErrors(err);
      setError(serverErr);
      throw serverErr;
    } finally {
      setProcessingId(null);
    }
  };

  const cancel = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await serviceService.delete(id);
      await fetchServices();
      return true;
    } catch (err) {
      const serverErr = extractServerErrors(err);
      setError(serverErr);
      throw serverErr;
    } finally {
      setProcessingId(null);
    }
  };

  return {
    services,
    isLoading,
    error,
    processingId,
    accept,
    reject,
    complete,
    cancel,
    deleteService: cancel,
    refetch: fetchServices,
  };
}
