import React, { useState, createContext, useContext } from 'react';
import {
  Post,
  Comment,
  mockPosts,
  mockComments,
  mockCategories,
  mockTags,
  User,
  mockUsers } from
'../data/mockData';
interface BlogContextType {
  posts: Post[];
  comments: Comment[];
  categories: string[];
  tags: string[];
  users: User[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'views'>) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addComment: (
  comment: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'replies'>)
  => void;
  deleteComment: (id: string) => void;
  toggleLike: (postId: string) => void;
  getAuthor: (authorId: string) => User | undefined;
}
const BlogContext = createContext<BlogContextType | undefined>(undefined);
export function BlogProvider({ children }: {children: React.ReactNode;}) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [categories] = useState<string[]>(mockCategories);
  const [tags] = useState<string[]>(mockTags);
  const [users] = useState<User[]>(mockUsers);
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
  commentData: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'replies'>) =>
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
        tags,
        users,
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