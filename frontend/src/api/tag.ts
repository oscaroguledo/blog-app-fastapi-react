import { apiFetch, parseApiResponse } from '@/utils/apiClient';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const tagApi = {
  getAll: async (params?: { search_query?: string; limit?: number; offset?: number }): Promise<ApiResponse<TagsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.search_query) queryParams.append('search_query', params.search_query);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    
    const response = await apiFetch(`${API_URL}/tags/?${queryParams}`);
    return parseApiResponse<TagsResponse>(response);
  },

  getById: async (id: string): Promise<ApiResponse<Tag>> => {
    const response = await apiFetch(`${API_URL}/tags/${id}`);
    return parseApiResponse<Tag>(response);
  },

  create: async (data: { name: string; slug: string; description?: string }): Promise<ApiResponse<Tag>> => {
    const response = await apiFetch(`${API_URL}/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Tag>(response);
  },

  update: async (id: string, data: Partial<{ name: string; slug: string; description: string }>): Promise<ApiResponse<Tag>> => {
    const response = await apiFetch(`${API_URL}/tags/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return parseApiResponse<Tag>(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiFetch(`${API_URL}/tags/${id}`, {
      method: 'DELETE',
    });
    return parseApiResponse<void>(response);
  },
};
