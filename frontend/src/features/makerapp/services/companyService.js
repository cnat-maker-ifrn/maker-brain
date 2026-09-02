import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export const companyService = {
  list: () => apiClient.get(endpoints.companies.list),
};