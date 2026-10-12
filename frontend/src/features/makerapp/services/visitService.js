import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

function toFormData(data) {
  const payload = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      payload.append(key, value);
    }
  });
  return payload;
}

export const visitService = {
  listMine: () => apiClient.get(endpoints.visits.mine),
  listAll: () => apiClient.get(endpoints.visits.list),
  accept: (id) => apiClient.post(endpoints.visits.accept(id)),
  reject: (id) => apiClient.post(endpoints.visits.reject(id)),
  close: (id, data) => {
    const payload = data instanceof FormData ? data : toFormData(data);
    return apiClient.patch(endpoints.visits.close(id), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  create: (data) => apiClient.post(endpoints.visits.create, data),
  getBusySlots: (date) => apiClient.get(endpoints.visits.busySlots(date)),
};