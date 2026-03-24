import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082', // Default Spring Boot port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/user/signup', data),
};

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getCategoryAnalytics: () => api.get('/admin/analytics/category'),
  getAnalyticsByType: (type) => api.get(`/admin/analytics/${type}`),
  getEmployees: () => api.get('/admin/employees'),
  createEmployee: (data) => api.post('/admin/create-employee', data),
  updateEmployee: (id, data) => api.put(`/admin/employee/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employee/${id}`),
  getActivityLogs: () => api.get('/admin/activity-logs'),
  // Admin Inventory
  getProducts: () => api.get('/admin/products'),
  addProduct: (data) => api.post('/admin/add-product', data),
  addStock: (productName, quantity) => api.post('/admin/add-stock', { productName, quantity }),
  reduceStock: (productName, quantity) => api.post('/admin/reduce-stock', { productName, quantity }),
  deleteProduct: (id) => api.delete(`/admin/product/${id}`),
};

export const inventoryService = {
  getProducts: () => api.get('/employee/products'),
  addProduct: (data) => api.post('/employee/add-product', data),
  addStock: (productName, quantity) => api.post('/employee/add-stock', { productName, quantity }),
  reduceStock: (productName, quantity) => api.post('/employee/reduce-stock', { productName, quantity }),
  deleteProduct: (id) => api.delete(`/employee/product/${id}`),
};

export const userService = {
  createOrder: (items) => api.post('/user/orders', { items }),
  getOrders: () => api.get('/user/orders'),
  returnItem: (orderItemId) => api.post(`/user/return/${orderItemId}`),
};

export default api;
