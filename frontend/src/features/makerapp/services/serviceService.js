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

export const serviceService = {
  create: (data) =>
    apiClient.post(endpoints.services.create, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listMine: () => apiClient.get(endpoints.services.mine),
  listAll: () => apiClient.get(endpoints.services.list),
  accept: (id) => apiClient.post(endpoints.services.accept(id)),
  reject: (id) => apiClient.post(endpoints.services.reject(id)),
  complete: (id) => apiClient.post(endpoints.services.complete(id)),
  delete: (id) => apiClient.delete(endpoints.services.delete(id)),
};