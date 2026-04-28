import axiosInstance from '@/utils/axiosInstance';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactApi = {
  submit: async (data: ContactRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/contact/', data);
    return response.data;
  },

  // Admin endpoints
  list: async (limit: number = 100, offset: number = 0, q?: string): Promise<ApiResponse<ContactMessage[]>> => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    if (q) params.set('q', q);
    const response = await axiosInstance.get(`/contact?${params.toString()}`);
    return response.data;
  },

  markRead: async (id: string): Promise<ApiResponse<ContactMessage>> => {
    const response = await axiosInstance.patch(`/contact/${id}/read`);
    return response.data;
  }
};
