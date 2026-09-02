import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const schoolService = {
  list: () => apiClient.get(endpoints.schools.list),
};