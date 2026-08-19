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

export const authService = {
  registerRequester: (data) =>
    apiClient.post(endpoints.requesters.register, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  registerScholarshipStudent: (data) =>
    apiClient.post(endpoints.scholarshipStudents.register, toFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  login: async ({email, password}) => {
    const { data } = await apiClient.post(endpoints.auth.login, {email, password});
    return data; // {access, refresh}
  }
};