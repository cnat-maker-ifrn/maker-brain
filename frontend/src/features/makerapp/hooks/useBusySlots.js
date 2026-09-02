import { useState, useEffect, useCallback } from 'react';
import { visitService } from '../services/visitService';

function toDateParam(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useBusySlots(date) {
  const [busySlots, setBusySlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBusySlots = useCallback(async () => {
    if (!date) return;
    setIsLoading(true);
    try {
      const { data } = await visitService.getBusySlots(toDateParam(date));
      setBusySlots(data);
    } catch {
      setBusySlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchBusySlots();
  }, [fetchBusySlots]);

  return { busySlots, isLoading, refetch: fetchBusySlots };
}