import React, { useState, createContext, useContext, useEffect } from 'react';
import { postApi } from '@/api/post';
import { categoryApi } from '@/api/category';
import { commentApi } from '@/api/comment';
import { Post } from '@/api/post';
import { Comment } from '@/api/comment';
import { User, userApi } from '@/api/user';

interface PaginationState {
  limit: number;
  offset: number;
  total: number;
}

interface BlogContextType {
  posts: Post[];
  comments: Comment[];
  categories: string[];
  users: User[];
  pagination: PaginationState;
  likedPosts: Set<string>;
  fetchPosts: (params?: { limit?: number; offset?: number; is_published?: boolean; featured?: boolean }) => Promise<void>;
  fetchPostsPaginated: (page: number, limit: number) => Promise<{ posts: Post[]; total: number }>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  getAuthor: (authorId: string) => User | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: {children: React.ReactNode;}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 10,
    offset: 0,
    total: 0,
  });

  useEffect(() => {
    // Fetch initial data in parallel
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes, commentsRes, usersRes] = await Promise.all([
          postApi.getAll({ limit: 10, offset: 0, is_published: true }),
          categoryApi.getAll(),
          commentApi.getAll(),
          userApi.getAll()
        ]);

        console.log('Posts response:', postsRes);
        console.log('Categories response:', categoriesRes);
        console.log('Comments response:', commentsRes);
        console.log('Users response:', usersRes);

        if (postsRes.success && postsRes.data) {
          setPosts(postsRes.data.posts);
          setPagination(postsRes.data.pagination);
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data.map((c: any) => c.name));
        }

        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data);
        }

        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchPosts = async (params?: { limit?: number; offset?: number; is_published?: boolean; featured?: boolean }) => {
    try {
      const response = await postApi.getAll(params);
      if (response.success && response.data) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchPostsPaginated = async (page: number, limit: number): Promise<{ posts: Post[]; total: number }> => {
    const offset = (page - 1) * limit;
    try {
      const response = await postApi.getAll({ limit, offset, is_published: true });
      if (response.success && response.data) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
        return { posts: response.data.posts, total: response.data.pagination.total };
      }
      return { posts: [], total: 0 };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return { posts: [], total: 0 };
    }
  };
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => {
    try {
      const response = await postApi.create(postData as any);
      if (response.success && response.data) {
        setPosts((prev) => [response.data, ...(prev ?? [])]);
      }
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };
  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const response = await postApi.update(id, updates);
      if (response.success && response.data) {
        setPosts((prev) => (prev ? prev.map((post) => post.id === id ? response.data! : post) : [response.data!]));
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };
  const deletePost = async (id: string) => {
    try {
      const response = await postApi.delete(id);
      if (response.success) {
        setPosts((prev) => (prev ? prev.filter((post) => post.id !== id) : []));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => {
    try {
      const response = await commentApi.create(commentData);
      if (response.success && response.data) {
        setComments((prev) => [...(prev ?? []), response.data]);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  const deleteComment = async (id: string) => {
    try {
      const response = await commentApi.delete(id);
      if (response.success) {
        setComments((prev) => (prev ? prev.filter((c) => c.id !== id) : []));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };
  const toggleLike = async (postId: string) => {
    try {
      const isLiked = likedPosts.has(postId);
      const response = isLiked
        ? await postApi.unlike(postId)
        : await postApi.like(postId);

      if (response.success) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
        setPosts((prev) => (prev ? prev.map((p) => p.id === postId
            ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
            : p
          ) : prev));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const getAuthor = (authorId: string) => {
    return users.find((u) => u.id === authorId);
  };
  return (
    <BlogContext.Provider
      value={{
        posts,
        comments,
        categories,
        users,
        pagination,
        likedPosts,
        fetchPosts,
        fetchPostsPaginated,
        addPost,
        updatePost,
        deletePost,
        addComment,
        deleteComment,
        toggleLike,
        getAuthor
      }}>
      
      {children}
    </BlogContext.Provider>);

}
export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}