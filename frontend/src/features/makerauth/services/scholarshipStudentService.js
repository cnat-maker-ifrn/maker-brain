import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const scholarshipStudentService = {
  list: () => apiClient.get(endpoints.scholarshipStudents.list),
  listPending: () => apiClient.get(endpoints.scholarshipStudents.pending),
  accept: (id) => apiClient.post(endpoints.scholarshipStudents.accept(id)),
  reject: (id) => apiClient.delete(endpoints.scholarshipStudents.reject(id)),
  promote: (id) => apiClient.post(endpoints.scholarshipStudents.promote(id)),
  removeManager: (id) => apiClient.post(endpoints.scholarshipStudents.removeManager(id)),
  demoteToRequester: (id) => apiClient.post(endpoints.scholarshipStudents.demoteToRequester(id)),
};