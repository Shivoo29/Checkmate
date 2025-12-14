import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authApi = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
}

export const projectsApi = {
  list: () => apiClient.get('/projects'),
  get: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: { name: string; target_url: string; description?: string }) =>
    apiClient.post('/projects', data),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
}

export const testsApi = {
  create: (data: { project_id: string; test_type: string }) =>
    apiClient.post('/tests', data),
  get: (id: string) => apiClient.get(`/tests/${id}`),
  getIssues: (id: string) => apiClient.get(`/tests/${id}/issues`),
  submitManual: (testId: string, data: any) =>
    apiClient.post(`/tests/${testId}/manual`, data),
}
