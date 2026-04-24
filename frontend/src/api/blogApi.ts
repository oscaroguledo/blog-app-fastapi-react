const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status_code?: number;
}

// Posts
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

export const postsApi = {
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

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await fetch(`${API_URL}/categories/`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await fetch(`${API_URL}/categories/${id}`);
    return response.json();
  },
};

// Comments
export interface Comment {
  id: string;
  postId: string;
  author_id: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface CommentCreate {
  postId: string;
  content: string;
}

export const commentsApi = {
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

// Users
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

export const usersApi = {
  register: async (data: UserCreate): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data: UserLogin): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMe: async (token: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateMe: async (data: Partial<User>, token: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getAll: async (token: string): Promise<ApiResponse<User[]>> => {
    const response = await fetch(`${API_URL}/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
