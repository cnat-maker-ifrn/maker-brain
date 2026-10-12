import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const scheduleBlockService = {
  list: () => apiClient.get(endpoints.scheduleBlocks.list),
  create: (data) => apiClient.post(endpoints.scheduleBlocks.create, data),
  delete: (id) => apiClient.delete(endpoints.scheduleBlocks.delete(id)),
  bulkDelete: (ids) => apiClient.post(endpoints.scheduleBlocks.bulkDelete, { ids }),
};
