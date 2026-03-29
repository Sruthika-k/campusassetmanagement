import api from '../services/api';

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Asset APIs
export const assetAPI = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  create: (asset) => api.post('/assets', asset),
  update: (id, asset) => api.put(`/assets/${id}`, asset),
  delete: (id) => api.delete(`/assets/${id}`),
  getQrLabelUrl: (id) => `${api.defaults.baseURL}/assets/${id}/qr-label`,
  regenerateQr: (id) => api.post(`/assets/${id}/regenerate-qr`),
  exportCsv: () => api.get('/assets/export', { responseType: 'blob' }),
  clearRetired: () => api.delete('/assets/retired'),
};

// Borrow APIs
export const borrowAPI = {
  getAll:          () => api.get('/borrow'),
  getMyRequests:   () => api.get('/borrow/my'),
  getById:         (id) => api.get(`/borrow/${id}`),
  // userId is extracted from JWT on the backend — only send assetId
  request:         (assetId) => api.post('/borrow/request', { assetId }),
  approve:         (id) => api.post(`/borrow/${id}/approve`),
  reject:          (id) => api.post(`/borrow/${id}/reject`),
  return:          (id) => api.post(`/borrow/${id}/return`),
};

// Issue APIs
export const issueAPI = {
  getAll:      () => api.get('/issues'),
  getMyIssues: () => api.get('/issues/my'),
  getMyTasks:  () => api.get('/issues/my'),   // alias for technician
  getById:     (id) => api.get(`/issues/${id}`),
  // userId extracted from JWT on backend
  report:      (assetId, description, priority = 'MEDIUM') =>
                 api.post('/issues', { assetId, description, priority }),
  assign:      (id, technicianId) => api.post(`/issues/${id}/assign`, { technicianId }),
  resolve:     (id, notes = '') => api.post(`/issues/${id}/resolve`, { notes }),
};

// User APIs
export const userAPI = {
  getAll:         (role) => api.get('/users', { params: { role } }),
  getTechnicians: () => api.get('/users/technicians'),
  getById:        (id) => api.get(`/users/${id}`),
  create:         (userData) => api.post('/users', userData),
  update:         (id, userData) => api.put(`/users/${id}`, userData),
  updateRole:     (id, role) => api.put(`/users/${id}/role`, { role }),
  delete:         (id) => api.delete(`/users/${id}`),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (dept) => api.post('/departments', dept),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Room APIs
export const roomAPI = {
  getAll: () => api.get('/rooms'),
  getByDepartment: (departmentId) => api.get(`/rooms/department/${departmentId}`),
  create: (room) => api.post('/rooms', room),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Reservation APIs
export const reservationAPI = {
  getAll:          ()         => api.get('/reservations'),
  getByAsset:      (assetId)  => api.get(`/reservations/asset/${assetId}`),
  getMyReservations: ()       => api.get('/reservations/my'),
  // startTime / endTime: ISO-8601 string e.g. "2026-03-15T09:00:00"
  create:          (assetId, startTime, endTime) =>
                     api.post('/reservations', { assetId, startTime, endTime }),
  cancel:          (id)       => api.delete(`/reservations/${id}`),
};

// History APIs
export const historyAPI = {
  getAssetHistory: (assetId) => api.get(`/assets/${assetId}/history`),
  getAllEvents:    ()        => api.get('/events'),
};

// Scan APIs (Public)
export const scanAPI = {
  getAssetInfo: (assetId) => api.get(`/scan/${assetId}`),
};

export default api;
