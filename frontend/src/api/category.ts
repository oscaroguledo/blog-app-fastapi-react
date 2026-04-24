import axiosInstance from '@/utils/axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const categoryApi = {
  getAll: async (params?: { search_query?: string; start_at?: string; end_at?: string; limit?: number; offset?: number }): Promise<ApiResponse<CategoriesResponse>> => {
    const response = await axiosInstance.get('/categories/', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug: string; description?: string }): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.post('/categories/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ name: string; slug: string; description: string }>): Promise<ApiResponse<Category>> => {
    const response = await axiosInstance.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/categories/${id}`);
    return response.data;
  },
};
