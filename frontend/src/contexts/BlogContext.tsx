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
  fetchPosts: (params?: { limit?: number; offset?: number; is_published?: boolean; featured?: boolean }) => Promise<void>;
  fetchPostsPaginated: (page: number, limit: number) => Promise<{ posts: Post[]; total: number }>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  deleteComment: (id: string) => void;
  toggleLike: (postId: string) => void;
  getAuthor: (authorId: string) => User | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: {children: React.ReactNode;}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 10,
    offset: 0,
    total: 0,
  });

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        await fetchPosts({ limit: 10, offset: 0, is_published: true });

        const categoriesRes = await categoryApi.getAll();
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data.categories.map((c: any) => c.name));
        }

        const commentsRes = await commentApi.getAll();
        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data.comments);
        }

        // Fetch users
        const usersRes = await userApi.getAll();
        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data.users);
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
  const addPost = (
  postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) =>
  {
    const newPost: Post = {
      ...postData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0
    };
    setPosts([newPost, ...posts]);
  };
  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(
      posts.map((post) =>
      post.id === id ?
      {
        ...post,
        ...updates
      } :
      post
      )
    );
  };
  const deletePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id));
  };
  const addComment = (
  commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>) =>
  {
    const newComment: Comment = {
      ...commentData,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    setComments([...comments, newComment]);
  };
  const deleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };
  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          // Simple toggle logic for mock purposes
          return {
            ...post,
            likes: post.likes + 1
          };
        }
        return post;
      })
    );
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