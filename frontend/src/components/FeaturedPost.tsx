import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Post, User } from '../data/mockData';
import { motion } from 'framer-motion';
export function FeaturedPost({ post, author }: {post: Post; author: User;}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5
      }}
      className="relative rounded-2xl overflow-hidden group">
      
      <div className="absolute inset-0">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full min-h-[400px] md:min-h-[500px] flex flex-col justify-end p-6 md:p-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((cat) =>
            <span
              key={cat}
              className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              
                {cat}
              </span>
            )}
          </div>

          <Link to={`/post/${post.id}`}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 group-hover:text-gray-200 transition-colors">
              {post.title}
            </h2>
          </Link>

          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={author?.avatar}
                alt={author?.name}
                className="h-10 w-10 rounded-full border-2 border-white/20" />
              
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{author?.name}</p>
                <div className="flex space-x-1 text-xs text-gray-400">
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
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

            <Link
              to={`/post/${post.id}`}
              className="hidden md:flex items-center text-white font-medium hover:text-accent transition-colors">
              
              Read Article <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>);

}