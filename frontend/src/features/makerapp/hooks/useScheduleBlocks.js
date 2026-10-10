import { useState, useEffect, useCallback } from 'react';
import { scheduleBlockService } from '../services/scheduleBlockService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useScheduleBlocks() {
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await scheduleBlockService.list();
      setBlocks(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const createBlocks = async (payload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await scheduleBlockService.create(payload);
      await fetchBlocks();
      return true;
    } catch (err) {
      setError(extractServerErrors(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBlock = async (id) => {
    setProcessingId(id);
    setError(null);
    try {
      await scheduleBlockService.delete(id);
      await fetchBlocks();
      return true;
    } catch (err) {
      setError(extractServerErrors(err));
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const bulkDeleteBlocks = async (ids) => {
    if (!ids || ids.length === 0) return false;
    setIsSubmitting(true);
    setError(null);
    try {
      await scheduleBlockService.bulkDelete(ids);
      await fetchBlocks();
      return true;
    } catch (err) {
      setError(extractServerErrors(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    blocks,
    isLoading,
    isSubmitting,
    error,
    processingId,
    fetchBlocks,
    createBlocks,
    deleteBlock,
    bulkDeleteBlocks,
  };
}
