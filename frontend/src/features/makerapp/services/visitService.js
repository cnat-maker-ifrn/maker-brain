import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const visitService = {
  listMine: () => apiClient.get(endpoints.visits.mine),
  listAll: () => apiClient.get(endpoints.visits.list),
  accept: (id) => apiClient.post(endpoints.visits.accept(id)),
  reject: (id) => apiClient.post(endpoints.visits.reject(id)),
};