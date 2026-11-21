const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiRequest = async (endpoint, { method = 'GET', body = null, headers = {} } = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during request.');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  signup: (userData) => apiRequest('/auth/signup', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),
  updatePassword: (passwords) => apiRequest('/auth/update-password', { method: 'PUT', body: passwords }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminStores: (params = '') => apiRequest(`/admin/stores${params ? `?${params}` : ''}`),
  getAdminUsers: (params = '') => apiRequest(`/admin/users${params ? `?${params}` : ''}`),
  createStore: (storeData) => apiRequest('/admin/stores', { method: 'POST', body: storeData }),
  createUser: (userData) => apiRequest('/admin/users', { method: 'POST', body: userData }),
  getAvailableOwners: () => apiRequest('/admin/available-owners'),

  // User
  getUserStores: (params = '') => apiRequest(`/stores${params ? `?${params}` : ''}`),
  submitRating: (storeId, rating) => apiRequest(`/stores/${storeId}/rating`, { method: 'POST', body: { rating } }),

  // Owner
  getOwnerDashboard: (params = '') => apiRequest(`/owner/dashboard${params ? `?${params}` : ''}`)
};
