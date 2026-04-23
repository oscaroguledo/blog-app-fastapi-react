import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Send } from
'lucide-react';
import { motion } from 'framer-motion';
export function PostDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const { posts, getAuthor, comments, addComment, toggleLike } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const post = posts.find((p) => p.id === id);
  const author = post ? getAuthor(post.authorId) : null;
  const postComments = comments.filter((c) => c.postId === id);
  if (!post || !author) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-xl text-muted-text">Post not found.</p>
        </div>
      </Layout>);

  }
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    addComment({
      postId: post.id,
      authorId: user.id,
      content: commentText
    });
    setCommentText('');
  };
  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            {post.categories.map((cat) =>
            <Link
              key={cat}
              to={`/search?category=${cat}`}
              className="text-accent font-medium text-sm hover:underline">
              
                {cat}
              </Link>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-text leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-text mb-8">{post.excerpt}</p>

          <div className="flex items-center justify-center space-x-4">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full" />
            
            <div className="text-left">
              <p className="font-medium text-text">{author.name}</p>
              <div className="flex items-center text-sm text-muted-text space-x-2">
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span>&middot;</span>
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" /> {post.readingTime} min
                  read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="rounded-2xl overflow-hidden mb-12">
          
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[600px]" />
          
        </motion.div>

        {/* Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Action Bar (Sticky on Desktop) */}
          <div className="lg:w-16 flex-shrink-0 order-2 lg:order-1">
            <div className="sticky top-24 flex lg:flex-col items-center justify-center gap-6 py-4 border-y lg:border-y-0 lg:border-r border-border">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex flex-col items-center text-muted-text hover:text-accent transition-colors group">
                
                <div className="p-2 rounded-full group-hover:bg-accent/10">
                  <Heart size={24} />
                </div>
                <span className="text-xs font-medium mt-1">{post.likes}</span>
              </button>

              <a
                href="#comments"
                className="flex flex-col items-center text-muted-text hover:text-accent transition-colors group">
                
                <div className="p-2 rounded-full group-hover:bg-accent/10">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium mt-1">
                  {postComments.length}
                </span>
              </a>

              <button className="flex flex-col items-center text-muted-text hover:text-accent transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-accent/10">
                  <Bookmark size={24} />
                </div>
              </button>

              <button className="flex flex-col items-center text-muted-text hover:text-accent transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-accent/10">
                  <Share2 size={24} />
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow order-1 lg:order-2 max-w-2xl">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              // In a real app, use a markdown parser like react-markdown.
              // Here we just dangerously set HTML or render text for mock purposes.
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, '<br/>')
              }} />
            

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {post.tags.map((tag) =>
              <Link
                key={tag}
                to={`/search?tag=${tag}`}
                className="bg-muted text-text px-3 py-1 rounded-full text-sm hover:bg-accent hover:text-white transition-colors">
                
                  #{tag}
                </Link>
              )}
            </div>

            {/* Author Bio Box */}
            <div className="mt-12 bg-surface border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-20 h-20 rounded-full" />
              
              <div>
                <h3 className="text-xl font-serif font-bold text-text mb-2">
                  Written by {author.name}
                </h3>
                <p className="text-muted-text mb-4">{author.bio}</p>
                <button className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors">
                  Follow
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div id="comments" className="mt-16 pt-8 border-t border-border">
              <h3 className="text-2xl font-serif font-bold text-text mb-8">
                Responses ({postComments.length})
              </h3>

              {isAuthenticated ?
              <form
                onSubmit={handleCommentSubmit}
                className="mb-10 flex gap-4">
                
                  <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full flex-shrink-0" />
                
                  <div className="flex-grow relative">
                    <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full bg-background border border-border rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent resize-none min-h-[100px] text-text" />
                  
                    <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute bottom-4 right-4 text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">
                    
                      <Send size={20} />
                    </button>
                  </div>
                </form> :

              <div className="mb-10 bg-muted p-6 rounded-xl text-center">
                  <p className="text-text mb-4">
                    Sign in to join the conversation.
                  </p>
                  <Link
                  to="/login"
                  className="bg-accent text-white px-6 py-2 rounded-full font-medium hover:bg-accent-hover transition-colors inline-block">
                  
                    Log In
                  </Link>
                </div>
              }

              <div className="space-y-8">
                {postComments.map((comment) => {
                  const commentAuthor = getAuthor(comment.authorId);
                  return (
                    <div key={comment.id} className="flex gap-4">
                      <img
                        src={commentAuthor?.avatar}
                        alt={commentAuthor?.name}
                        className="w-10 h-10 rounded-full flex-shrink-0" />
                      
                      <div className="flex-grow">
                        <div className="bg-surface border border-border rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-text">
                                {commentAuthor?.name}
                              </span>
                              <span className="text-xs text-muted-text ml-2">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <button className="text-muted-text hover:text-text">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                          <p className="text-text">{comment.content}</p>
                        </div>
                        <div className="flex gap-4 mt-2 ml-2">
                          <button className="flex items-center text-xs text-muted-text hover:text-accent">
                            <Heart size={14} className="mr-1" /> {comment.likes}
                          </button>
                          <button className="text-xs text-muted-text hover:text-accent">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>);

                })}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>);

}