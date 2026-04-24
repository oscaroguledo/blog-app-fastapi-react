const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

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

export const categoryApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetch(`${API_URL}/categories/`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${API_URL}/categories/${id}`);
    return response.json();
  },
};
