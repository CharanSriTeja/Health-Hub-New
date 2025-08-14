import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
};

// User API calls
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
};

// Appointment API calls
export const appointmentAPI = {
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  getAllAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  getAppointmentStats: () => api.get('/appointments/stats'),
  getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),
};

// Health Records API calls
export const healthRecordAPI = {
  createHealthRecord: (recordData) => api.post('/health-records', recordData),
  getAllHealthRecords: (params) => api.get('/health-records', { params }),
  getHealthRecordById: (id) => api.get(`/health-records/${id}`),
  updateHealthRecord: (id, recordData) => api.put(`/health-records/${id}`, recordData),
  deleteHealthRecord: (id) => api.delete(`/health-records/${id}`),
  shareHealthRecord: (id, shareData) => api.post(`/health-records/${id}/share`, shareData),
  exportHealthRecords: (params) => api.get('/health-records/export', { params }),
  getHealthRecordStats: () => api.get('/health-records/stats'),
};

// Prescription API calls
export const prescriptionAPI = {
  createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  getAllPrescriptions: (params) => api.get('/prescriptions', { params }),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id, prescriptionData) => api.put(`/prescriptions/${id}`, prescriptionData),
  deletePrescription: (id) => api.delete(`/prescriptions/${id}`),
  sharePrescription: (id, shareData) => api.post(`/prescriptions/${id}/share`, shareData),
  exportPrescriptions: (params) => api.get('/prescriptions/export', { params }),
  getPrescriptionStats: () => api.get('/prescriptions/stats'),
};

// Lab Reports API calls
export const labReportAPI = {
  createLabReport: (reportData) => api.post('/lab-reports', reportData),
  getAllLabReports: (params) => api.get('/lab-reports', { params }),
  getLabReportById: (id) => api.get(`/lab-reports/${id}`),
  updateLabReport: (id, reportData) => api.put(`/lab-reports/${id}`, reportData),
  deleteLabReport: (id) => api.delete(`/lab-reports/${id}`),
  downloadLabReport: (id) => api.get(`/lab-reports/${id}/download`, { responseType: 'blob' }),
  viewLabReport: (id) => api.get(`/lab-reports/${id}/view`),
  shareLabReport: (id, shareData) => api.post(`/lab-reports/${id}/share`, shareData),
  getLabReportStats: () => api.get('/lab-reports/stats'),
};

// Hospital API calls
export const hospitalAPI = {
  createHospital: (hospitalData) => api.post('/hospitals', hospitalData),
  getAllHospitals: (params) => api.get('/hospitals', { params }),
  getHospitalById: (id) => api.get(`/hospitals/${id}`),
  updateHospital: (id, hospitalData) => api.put(`/hospitals/${id}`, hospitalData),
  deleteHospital: (id) => api.delete(`/hospitals/${id}`),
  searchNearby: (params) => api.get('/hospitals/search-nearby', { params }),
};

// Doctor API calls
export const doctorAPI = {
  createDoctor: (doctorData) => api.post('/doctors', doctorData),
  getAllDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorsByHospital: (hospitalId, params) => api.get(`/doctors/hospital/${hospitalId}`, { params }),
  getAvailableSlots: (doctorId, params) => api.get(`/doctors/${doctorId}/available-slots`, { params }),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  getDoctorStats: () => api.get('/doctors/stats'),
};

export default api;
