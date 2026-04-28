import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Toast } from '@/components/ui/Toast';
import { Avatar } from '@/components/ui/Avatar';
import { PostDetailPageSkeleton } from '@/components/PostDetailPageSkeleton';
import { useBlog } from '@/contexts/BlogContext';
import { useAuth } from '@/contexts/AuthContext';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { Post } from '@/api/post';
import { Comment } from '@/api/comment';
import {
  Clock,
  Heart,
  Share2,
  MessageCircle,
  MoreHorizontal } from
'lucide-react';
import { motion } from 'framer-motion';

export function PostDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const { getAuthor, addComment, toggleLike } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [postRes, commentsRes] = await Promise.all([
          postApi.getById(id),
          commentApi.getAll({ post_id: id })
        ]);
        console.log('Post response:', postRes);
        console.log('Comments response:', commentsRes);
        if (postRes.success && postRes.data) {
          setPost(postRes.data);
        }
        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <PostDetailPageSkeleton />;
  }

  const author = post ? getAuthor(post.authorId) : null;
  const postComments = comments;

  if (!post) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-xl text-muted-text">Post not found.</p>
        </div>
      </Layout>);

  }
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    await addComment({
      postId: post.id,
      content: commentText,
      authorId: user!.id
    });
    setCommentText('');
    
    // Refresh comments to get the new one with proper data
    const commentsRes = await commentApi.getAll({ post_id: id });
    if (commentsRes.success && commentsRes.data) {
      setComments(commentsRes.data);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setToast({ message: 'Link copied to clipboard!' });
    }
  };

  return (
    <Layout>
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: post.categories[0] || 'Articles', href: `/search?category=${post.categories[0] || ''}` },
            { label: post.title }
          ]}
        />

        {/* Header */}
        <header className="mb-12 max-w-4xl mx-auto">
          {/* Categories */}
          <div className="flex items-center gap-2 mb-6">
            {post.categories.map((cat) => (
              <Link
                key={cat}
                to={`/search?category=${cat}`}
                className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider rounded-custom hover:bg-accent hover:text-white transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-text leading-tight mb-6 tracking-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl md:text-2xl text-muted-text mb-8 leading-relaxed font-light">
            {post.excerpt}
          </p>

          {/* Author Meta */}
          <div className="flex items-center gap-4 py-4 border-y border-border">
            <Avatar
              src={author?.avatar}
              alt={author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
              size="lg"
            />
            <div className="flex-grow">
              <p className="font-semibold text-text">{author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}</p>
              <p className="text-sm text-muted-text">{author?.bio || ''}</p>
            </div>
            <div className="text-right text-sm text-muted-text">
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              <div className="flex items-center justify-end mt-1">
                <Clock size={14} className="mr-1" /> {post.readingTime} min read
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 rounded-custom overflow-hidden"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </motion.div>

        {/* Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-grow max-w-3xl">
            {/* Article Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, '<br/>')
              }}
            />

            {/* Author Bio Box */}
            {author && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface border border-border rounded-custom p-8 mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar
                  src={author.avatar}
                  alt={`${author.firstName} ${author.lastName}`}
                  size="lg"
                  className="w-20 h-20"
                />
                <div className="flex-grow">
                  <h3 className="text-xl font-serif font-bold text-text mb-2">
                    {author.firstName} {author.lastName}
                  </h3>
                  <p className="text-muted-text mb-4 leading-relaxed">{author.bio}</p>
                </div>
              </div>
            </motion.div>
            )}

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              id="comments"
              className="border-t border-border pt-12"
            >
              <h3 className="text-2xl font-serif font-bold text-text mb-8">
                Responses ({postComments.length})
              </h3>

              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-12">
                  <div className="flex gap-4">
                    <Avatar
                      src={user?.avatar}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      size="md"
                    />
                    <div className="flex-grow">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full bg-background border border-border rounded-custom p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent resize-none min-h-[120px] text-text"
                      />
                      <div className="flex justify-end mt-4">
                        <Button
                          type="submit"
                          disabled={!commentText.trim()}
                          variant="primary"
                          size="md"
                        >
                          Post Response
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-muted p-8 rounded-custom text-center mb-12">
                  <p className="text-text mb-4 text-lg">
                    Sign in to join the conversation
                  </p>
                  <Link to="/login">
                    <Button variant="primary" size="md">
                      Log In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {postComments.map((comment) => {
                  const commentAuthor = getAuthor(comment.authorId);
                  return (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar
                        src={commentAuthor?.avatar}
                        alt={`${commentAuthor?.firstName} ${commentAuthor?.lastName}`}
                        size="md"
                      />
                      <div className="flex-grow">
                        <div className="bg-surface border border-border rounded-custom p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-semibold text-text">
                                {commentAuthor?.firstName} {commentAuthor?.lastName}
                              </span>
                              <span className="text-xs text-muted-text ml-2">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-muted-text hover:text-text p-1">
                              <MoreHorizontal size={16} />
                            </Button>
                          </div>
                          <p className="text-text leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Sticky Actions */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Action Buttons */}
              <div className="bg-surface border border-border rounded-custom p-4">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => toggleLike(post.id)}
                    variant="outline"
                    size="md"
                    className="flex items-center justify-center gap-2"
                  >
                    <Heart size={18} />
                    <span>{post.likes} Likes</span>
                  </Button>
                  <a
                    href="#comments"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-custom text-text hover:bg-muted transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{postComments.length} Comments</span>
                  </a>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="md"
                    className="flex items-center justify-center gap-2"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Reading Progress */}
              <div className="bg-surface border border-border rounded-custom p-4">
                <h4 className="text-sm font-semibold text-text mb-3">Table of Contents</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-muted-text hover:text-accent transition-colors">
                    Introduction
                  </a>
                  <a href="#" className="block text-sm text-muted-text hover:text-accent transition-colors">
                    Main Content
                  </a>
                  <a href="#comments" className="block text-sm text-muted-text hover:text-accent transition-colors">
                    Comments
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}