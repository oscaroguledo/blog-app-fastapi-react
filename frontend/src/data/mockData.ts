// This file is kept for type reference only
// All data is now fetched from the API via @/api/blogApi

export type Role = 'Writer' | 'Editor' | 'Admin' | 'Reader';

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
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
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