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
};