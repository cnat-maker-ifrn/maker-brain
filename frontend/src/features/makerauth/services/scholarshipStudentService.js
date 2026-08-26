import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const scholarshipStudentService = {
  listPending: () => apiClient.get(endpoints.scholarshipStudents.pending),
  accept: (id) => apiClient.post(endpoints.scholarshipStudents.accept(id)),
  reject: (id) => apiClient.delete(endpoints.scholarshipStudents.reject(id)),
};