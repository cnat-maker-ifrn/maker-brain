export const endpoints = {
  auth: {
    login: '/makerauth/auth/token/',
    refresh: '/makerauth/auth/token/refresh/',
  },
  requesters: {
    register: '/makerauth/requesters/',
  },
  scholarshipStudents: {
    register: '/makerauth/scholarship-students/',
    pending: '/makerauth/scholarship-students/pending/',
    accept: (id) => `/makerauth/scholarship-students/${id}/accept/`,
    reject: (id) => `/makerauth/scholarship-students/${id}/reject/`
  },
  visits: {
    create: '/makerapp/visits/',
    mine: '/makerapp/visits/mine/',
    list: '/makerapp/visits/',
    busySlots: (date) => `/makerapp/visits/busy-slots/?date=${date}`,
    accept: (id) => `/makerapp/visits/${id}/accept/`,
    reject: (id) => `/makerapp/visits/${id}/reject/`,
  },
  schools: {
    list: '/makerapp/schools/',
  },
  companies: {
    list: '/makerapp/companies/',
  },
};