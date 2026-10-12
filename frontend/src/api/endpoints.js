export const endpoints = {
  auth: {
    login: '/makerauth/auth/token/',
    refresh: '/makerauth/auth/token/refresh/',
    me: '/makerauth/me/',
  },
  requesters: {
    register: '/makerauth/requesters/',
  },
  scholarshipStudents: {
    list: '/makerauth/scholarship-students/',
    register: '/makerauth/scholarship-students/',
    pending: '/makerauth/scholarship-students/pending/',
    accept: (id) => `/makerauth/scholarship-students/${id}/accept/`,
    reject: (id) => `/makerauth/scholarship-students/${id}/reject/`,
    promote: (id) => `/makerauth/scholarship-students/${id}/promote/`,
    removeManager: (id) => `/makerauth/scholarship-students/${id}/remove-manager/`,
    demoteToRequester: (id) => `/makerauth/scholarship-students/${id}/demote-to-requester/`,
  },
  visits: {
    create: '/makerapp/visits/',
    mine: '/makerapp/visits/mine/',
    list: '/makerapp/visits/',
    busySlots: (date) => `/makerapp/visits/busy-slots/?date=${date}`,
    accept: (id) => `/makerapp/visits/${id}/accept/`,
    reject: (id) => `/makerapp/visits/${id}/reject/`,
    close: (id) => `/makerapp/visits/${id}/close/`,
  },
  schools: {
    list: '/makerapp/schools/',
  },
  companies: {
    list: '/makerapp/companies/',
  },
  services: {
    create: '/makerapp/services/',
    mine: '/makerapp/services/mine/',
  },
  reports: {
    data: (params) => {
      const query = new URLSearchParams();
      if (params?.year) query.append('year', params.year);
      if (params?.month) query.append('month', params.month);
      const qs = query.toString();
      return qs ? `/makerapp/reports/data/?${qs}` : '/makerapp/reports/data/';
    },
    pdf: (params) => {
      const query = new URLSearchParams();
      if (params?.year) query.append('year', params.year);
      if (params?.month) query.append('month', params.month);
      const qs = query.toString();
      return qs ? `/makerapp/reports/pdf/?${qs}` : '/makerapp/reports/pdf/';
    },
  },
  scheduleBlocks: {
    list: '/makerapp/schedule-blocks/',
    create: '/makerapp/schedule-blocks/',
    delete: (id) => `/makerapp/schedule-blocks/${id}/`,
    bulkDelete: '/makerapp/schedule-blocks/bulk-delete/',
  },
};