// Fee Management API
export const feeManagementAPI = {
  getAll: (params = {}) => api.get('/fee-management', { params }),
  getById: (id) => api.get(`/fee-management/${id}`),
  create: (data) => api.post('/fee-management', data),
  update: (id, data) => api.put(`/fee-management/${id}`, data),
  delete: (id) => api.delete(`/fee-management/${id}`),
  getStats: () => api.get('/fee-management/stats/overview'),
};
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://hm-sbackend.vercel.app/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// Students API
export const studentsAPI = {
  getAll: (params = {}) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getStats: () => api.get('/students/stats'),
  enroll: (id, courseData) => api.post(`/students/${id}/enroll`, courseData),
  unenroll: (id, courseId) => api.delete(`/students/${id}/unenroll/${courseId}`),
};

// Faculty API
export const facultyAPI = {
  getAll: (params = {}) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
  getStats: () => api.get('/faculty/stats'),
  getByDepartment: (dept) => api.get(`/faculty/department/${dept}`),
};

// Courses API
export const coursesAPI = {
  getAll: (params = {}) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getStats: () => api.get('/courses/stats'),
  assignInstructor: (id, instructorData) => api.post(`/courses/${id}/assign-instructor`, instructorData),
};

// Admissions API
export const admissionsAPI = {
  getAll: (params = {}) => api.get('/admissions', { params }),
  getById: (id) => api.get(`/admissions/${id}`),
  create: (data) => api.post('/admissions', data),
  update: (id, data) => api.put(`/admissions/${id}`, data),
  updateStatus: (id, statusData) => api.put(`/admissions/${id}/status`, statusData),
  delete: (id) => api.delete(`/admissions/${id}`),
  getStats: () => api.get('/admissions/stats'),
};

// Examinations API
export const examinationsAPI = {
  getAll: (params = {}) => api.get('/examinations', { params }),
  getById: (id) => api.get(`/examinations/${id}`),
  create: (data) => api.post('/examinations', data),
  update: (id, data) => api.put(`/examinations/${id}`, data),
  delete: (id) => api.delete(`/examinations/${id}`),
  getStats: () => api.get('/examinations/stats/overview'),
  getUpcoming: (params = {}) => api.get('/examinations/upcoming/list', { params }),
  getToday: () => api.get('/examinations/today/list'),
  getByCourse: (course) => api.get(`/examinations/course/${course}`),
  getByDateRange: (startDate, endDate) => api.get(`/examinations/date-range/${startDate}/${endDate}`),
  updateStatus: (id, status) => api.put(`/examinations/${id}/status`, { status }),
};

// Fee Management API
export const feeAPI = {
  getAll: (params = {}) => api.get('/fee-management', { params }),
  getById: (id) => api.get(`/fee-management/${id}`),
  create: (data) => api.post('/fee-management', data),
  update: (id, data) => api.put(`/fee-management/${id}`, data),
  delete: (id) => api.delete(`/fee-management/${id}`),
  recordPayment: (id, paymentData) => api.post(`/fee-management/${id}/payment`, paymentData),
  getByStudent: (studentId) => api.get(`/fee-management/student/${studentId}`),
  getStats: () => api.get('/fee-management/stats'),
};

// Timetable API
export const timetableAPI = {
  getAll: (params = {}) => api.get('/timetable', { params }),
  getById: (id) => api.get(`/timetable/${id}`),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
  getByFaculty: (facultyId) => api.get(`/timetable/faculty/${facultyId}`),
  getByCourse: (courseId) => api.get(`/timetable/course/${courseId}`),
  checkConflicts: (data) => api.post('/timetable/check-conflicts', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  getByUser: (userType, userId) => api.get(`/notifications/user/${userType}/${userId}`),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

// Reports API
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getStudents: (params = {}) => api.get('/reports/students', { params }),
  getFaculty: (params = {}) => api.get('/reports/faculty', { params }),
  getCourses: (params = {}) => api.get('/reports/courses', { params }),
  getAdmissions: (params = {}) => api.get('/reports/admissions', { params }),
  getFinancial: (params = {}) => api.get('/reports/financial', { params }),
  getRecentActivities: (params = {}) => api.get('/reports/recent-activities', { params }),
  getPendingTasks: (params = {}) => api.get('/reports/pending-tasks', { params }),
  exportData: (type, format = 'csv') => api.get(`/reports/export/${type}`, {
    params: { format },
    responseType: 'blob'
  }),
};

// Settings API
export const settingsAPI = {
  getAll: (params = {}) => api.get('/settings', { params }),
  getByKey: (category, key) => api.get(`/settings/${category}/${key}`),
  createOrUpdate: (data) => api.post('/settings', data),
  update: (category, key, data) => api.put(`/settings/${category}/${key}`, data),
  delete: (category, key) => api.delete(`/settings/${category}/${key}`),
  getByCategory: (category) => api.get(`/settings/category/${category}`),
  getPublic: () => api.get('/settings/public/all'),
  initialize: () => api.post('/settings/initialize'),
  bulkUpdate: (data) => api.put('/settings/bulk', data),
  export: (params = {}) => api.get('/settings/export', { params }),
  import: (data) => api.post('/settings/import', data),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
