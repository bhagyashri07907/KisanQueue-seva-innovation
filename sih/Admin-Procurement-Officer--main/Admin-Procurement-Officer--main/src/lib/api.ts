import axios, { AxiosInstance } from 'axios';

const TOKEN_KEY = 'kisanqueue_auth_token';
const USER_KEY = 'kisanqueue_auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user: any) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): any | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Axios HTTP Client for FastAPI / Express REST APIs
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/officer/login') {
        console.warn('Authentication expired or unauthorized:', error.response.data?.error || error.message);
      }
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  let data = options.body;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // keep raw string if not JSON
    }
  }

  try {
    const res = await apiClient.request<T>({
      url,
      method,
      data,
      headers: options.headers,
    });
    return res.data;
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      `Request failed with status ${err.response?.status || 500}`;
    throw new Error(errorMsg);
  }
}

