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
    const response = await fetch(`${API_URL}/comments/${queryParams}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await fetch(`${API_URL}/comments/${id}`);
    return response.json();
  },

  create: async (data: CommentCreate, token: string): Promise<ApiResponse<Comment>> => {
    const response = await fetch(`${API_URL}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<CommentCreate>, token: string): Promise<ApiResponse<Comment>> => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
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
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  like: async (id: string, token: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/comments/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  unlike: async (id: string, token: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_URL}/comments/${id}/unlike`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
