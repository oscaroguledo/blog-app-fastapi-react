const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  categories: string[];
  createdAt: string;
  readingTime: number;
  likes: number;
  views: number;
  isPublished: boolean;
  featured?: boolean;
}

export interface PostCreate {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categories: string[];
  readingTime: number;
  isPublished: boolean;
  featured?: boolean;
}

export const postApi = {
  getAll: async (params?: { page?: number; limit?: number; category?: string; author?: string }): Promise<ApiResponse<Post[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.author) queryParams.append('author', params.author);
    
    const response = await fetch(`${API_URL}/posts/?${queryParams}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await fetch(`${API_URL}/posts/${id}`);
    return response.json();
  },

  create: async (data: PostCreate, token: string): Promise<ApiResponse<Post>> => {
    const response = await fetch(`${API_URL}/posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<PostCreate>, token: string): Promise<ApiResponse<Post>> => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string, token: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
