import axiosInstance from '@/utils/axiosInstance';

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
    const response = await axiosInstance.get('/tags/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Tag>> => {
    const response = await axiosInstance.get(`/tags/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug: string; description?: string }): Promise<ApiResponse<Tag>> => {
    const response = await axiosInstance.post('/tags/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ name: string; slug: string; description: string }>): Promise<ApiResponse<Tag>> => {
    const response = await axiosInstance.patch(`/tags/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/tags/${id}`);
    return response.data;
  },
};
