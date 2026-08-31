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
    mine: '/makerapp/visits/mine/',
    list: '/makerapp/visits/',
    accept: (id) => `/makerapp/visits/${id}/accept/`,
    reject: (id) => `/makerapp/visits/${id}/reject/`,
  },
};