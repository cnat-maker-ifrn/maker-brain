import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const scholarshipStudentService = {
  listPending: () => apiClient.get(endpoints.makerauth.scholarshipStudents.pending),
  accept: (id) => apiClient.post(endpoints.makerauth.scholarshipStudents.accept(id)),
  reject: (id) => apiClient.delete(endpoints.makerauth.scholarshipStudents.reject(id)),
};