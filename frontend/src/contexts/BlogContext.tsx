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
  bookmarkedPosts: Set<string>;
  fetchPosts: (params?: { limit?: number; offset?: number; is_published?: boolean; featured?: boolean }) => Promise<void>;
  fetchPostsPaginated: (page: number, limit: number) => Promise<{ posts: Post[]; total: number }>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  getAuthor: (authorId: string) => User | undefined;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: {children: React.ReactNode;}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
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
  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => {
    try {
      const response = await postApi.create(postData as any);
      if (response.success && response.data) {
        setPosts([response.data, ...posts]);
      }
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };
  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const response = await postApi.update(id, updates);
      if (response.success && response.data) {
        setPosts(posts.map((post) => post.id === id ? response.data! : post));
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };
  const deletePost = async (id: string) => {
    try {
      const response = await postApi.delete(id);
      if (response.success) {
        setPosts(posts.filter((post) => post.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => {
    try {
      const response = await commentApi.create(commentData);
      if (response.success && response.data) {
        setComments([...comments, response.data]);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  const deleteComment = async (id: string) => {
    try {
      const response = await commentApi.delete(id);
      if (response.success) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };
  const toggleLike = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

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
        setPosts(posts.map((p) => p.id === postId
          ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
          : p
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const toggleBookmark = async (postId: string) => {
    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      const response = isBookmarked
        ? await postApi.unbookmark(postId)
        : await postApi.bookmark(postId);

      if (response.success) {
        setBookmarkedPosts(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
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
        bookmarkedPosts,
        fetchPosts,
        fetchPostsPaginated,
        addPost,
        updatePost,
        deletePost,
        addComment,
        deleteComment,
        toggleLike,
        toggleBookmark,
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