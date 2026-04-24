import { apiFetch, parseApiResponse } from '@/utils/apiClient';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommentCreate {
  postId: string;
  content: string;
}

export const commentApi = {
  getAll: async (postId?: string): Promise<ApiResponse<Comment[]>> => {
    const queryParams = postId ? `?post_id=${postId}` : '';
    const response = await apiFetch(`${API_URL}/comments/${queryParams}`);
    return parseApiResponse<Comment[]>(response);
  },

  getById: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await apiFetch(`${API_URL}/comments/${id}`);
    return parseApiResponse<Comment>(response);
  },

  create: async (data: CommentCreate): Promise<ApiResponse<Comment>> => {
    const response = await apiFetch(`${API_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Comment>(response);
  },

  update: async (id: string, data: Partial<CommentCreate>): Promise<ApiResponse<Comment>> => {
    const response = await apiFetch(`${API_URL}/comments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Comment>(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
    });
    return parseApiResponse<void>(response);
  },

  like: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/comments/${id}/like`, {
      method: 'POST',
    });
    return parseApiResponse<void>(response);
  },

  unlike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/comments/${id}/unlike`, {
      method: 'POST',
    });
    return parseApiResponse<void>(response);
  },
};
