import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Post, User } from '@/api/blogApi';
import { motion } from 'framer-motion';
interface PostCardProps {
  post: Post;
  author: User;
  index?: number;
}
export function PostCard({ post, author, index = 0 }: PostCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.1
      }}
      className="flex flex-col bg-surface rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300 group">
      
      <Link to={`/post/${post.id}`} className="relative h-48 overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute top-4 left-4">
          <span className="bg-surface/90 backdrop-blur-sm text-accent text-xs font-semibold px-3 py-1 rounded-full">
            {post.categories[0]}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-grow p-5">
        <Link to={`/post/${post.id}`} className="block mt-2">
          <h3 className="text-xl font-serif font-bold text-text line-clamp-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="mt-3 text-sm text-muted-text line-clamp-3">
            {post.excerpt}
          </p>
        </Link>

        <div className="mt-auto pt-5 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={author?.avatar}
              alt={`${author?.firstName} ${author?.lastName}`}
              className="h-8 w-8 rounded-full border border-border" />
            
            <div className="ml-3">
              <p className="text-sm font-medium text-text">{`${author?.firstName} ${author?.lastName}`}</p>
              <div className="flex space-x-1 text-xs text-muted-text">
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </time>
                <span>&middot;</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {post.readingTime} min read
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-muted-text text-sm">
            <Heart size={16} className="mr-1" />
            <span>{post.likes}</span>
          </div>
        </div>
      </div>
    </motion.article>);

}