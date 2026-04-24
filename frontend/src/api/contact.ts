import axiosInstance from '@/utils/axiosInstance';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const contactApi = {
  submit: async (data: ContactRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/contact/', data);
    return response.data;
  }
};
