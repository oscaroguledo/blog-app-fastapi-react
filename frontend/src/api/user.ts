import { apiFetch, parseApiResponse } from '@/utils/apiClient';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

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
  createdAt: string;
  followers: number;
  following: number;
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

export const userApi = {
  register: async (data: UserCreate): Promise<ApiResponse<{ user: User; token: string; refresh_token?: string }>> => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data: UserLogin): Promise<ApiResponse<{ user: User; token: string; refresh_token?: string }>> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiFetch(`${API_URL}/users/me`);
    return parseApiResponse<User>(response);
  },

  updateMe: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiFetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<User>(response);
  },

  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiFetch(`${API_URL}/users/`);
    return parseApiResponse<User[]>(response);
  },
};
