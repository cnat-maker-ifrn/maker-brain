import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const authService = {
  registerRequester: (data) => {
    const payload = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        payload.append(key, value);
      }
    });

    return apiClient.post(endpoints.requesters.register, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};