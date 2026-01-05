import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Convert snake_case to camelCase
const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// Convert object keys from snake_case to camelCase
const convertKeysToCamelCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeysToCamelCase);
  if (typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = convertKeysToCamelCase(obj[key]);
    return acc;
  }, {});
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and convert keys
api.interceptors.response.use(
  (response) => {
    // Convert snake_case to camelCase in response data
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};

// ==================== CLAIMS API ====================
export const claimsAPI = {
  create: async (formData) => {
    const response = await api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/claims/search/${query}`);
    return response.data;
  },

  getMyClaims: async () => {
    const response = await api.get('/claims/my-claims');
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/claims', { params });
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/claims/${id}/status`, data);
    return response.data;
  },

  uploadTransferProof: async (id, formData) => {
    const response = await api.post(`/claims/${id}/transfer-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/claims/${id}`);
    return response.data;
  },

  getDocument: async (claimId, documentId) => {
    const response = await api.get(`/claims/${claimId}/documents/${documentId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ==================== VERIFICATIONS API ====================
export const verificationsAPI = {
  create: async (formData) => {
    const response = await api.post('/verifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/verifications/search/${query}`);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/verifications', { params });
    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.put(`/verifications/${id}/status`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/verifications/${id}`);
    return response.data;
  }
};

// ==================== STATS API ====================
export const statsAPI = {
  getPublic: async () => {
    const response = await api.get('/stats/public');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  }
};

// ==================== NOTIFICATIONS API ====================
export const notificationsAPI = {
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default api;