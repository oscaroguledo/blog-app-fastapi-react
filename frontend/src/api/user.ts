import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  active: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const userApi = {
  // Auth endpoints (public)
  register: async (data: UserCreate): Promise<ApiResponse<{ user: User; token: string; refresh_token?: string }>> => {
    const response = await axiosInstance.post('/users/register', data);
    return response.data;
  },

  login: async (data: UserLogin): Promise<ApiResponse<{ user: User; token: string; refresh_token?: string }>> => {
    const response = await axiosInstance.post('/users/login', data);
    return response.data;
  },

  refresh: async (refresh_token: string): Promise<ApiResponse<{ user: User; token: string; refresh_token?: string }>> => {
    const response = await axiosInstance.post('/users/refresh', { refresh_token });
    return response.data;
  },

  // Current user endpoints (authenticated)
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  updateMe: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.patch('/users/me', data);
    return response.data;
  },

  deleteMe: async (): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete('/users/me');
    return response.data;
  },

  activateMe: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post('/users/me/activate');
    return response.data;
  },

  deactivateMe: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post('/users/me/deactivate');
    return response.data;
  },

  // User management endpoints
  getAll: async (params?: { active?: boolean; role?: string; firstName?: string; lastName?: string; email?: string; user_id?: string; start_at?: string; end_at?: string; limit?: number; offset?: number }): Promise<ApiResponse<User[]>> => {
    const response = await axiosInstance.get('/users/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  activate: async (id: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post(`/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post(`/users/${id}/deactivate`);
    return response.data;
  },

  resetPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post('/users/reset-password', { email });
    return response.data;
  },

  verifyEmail: async (email: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post('/users/verify-email', { email });
    return response.data;
  },
};
