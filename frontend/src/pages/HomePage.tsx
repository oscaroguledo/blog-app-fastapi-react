import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PostCard } from '@/components/PostCard';
import { CategorySidebar } from '@/components/CategorySidebar';
import { useBlog } from '@/contexts/BlogContext';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';

export function HomePage() {
  const { posts, categories, tags, users, getAuthor } = useBlog();
  const publishedPosts = posts.filter((p) => p.isPublished);
  const featuredPost = publishedPosts.find((p) => p.featured) || publishedPosts[0];
  const recentPosts = publishedPosts.filter((p) => p.id !== featuredPost?.id).slice(0, 6);
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        {featuredPost && (
          <section className="mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-custom overflow-hidden group"
            >
              <div className="absolute inset-0">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              <div className="relative h-full min-h-[400px] md:min-h-[500px] flex flex-col justify-end p-6 md:p-10">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.categories.map((cat) => (
                      <span
                        key={cat}
                        className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-custom"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <Link to={`/post/${featuredPost.id}`}>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 group-hover:text-gray-200 transition-colors">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={getAuthor(featuredPost.authorId)?.avatar}
                        alt={getAuthor(featuredPost.authorId)?.name}
                        className="h-10 w-10 rounded-custom border-2 border-white/20"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{getAuthor(featuredPost.authorId)?.name}</p>
                        <div className="flex space-x-1 text-xs text-gray-400">
                          <time dateTime={featuredPost.createdAt}>
                            {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                          <span>&middot;</span>
                          <span className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            {featuredPost.readingTime} min read
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/post/${featuredPost.id}`}
                      className="hidden md:flex items-center text-white font-medium hover:text-accent transition-colors"
                    >
                      Read Article <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Post Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-text">
                Latest Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {recentPosts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  author={getAuthor(post.authorId)!} 
                  index={index} 
                />
              ))}

              {publishedPosts.length > 7 && (
                <div className="mt-10 text-center">
                  <Link
                    to="/search"
                    className="inline-block bg-surface border border-border hover:border-accent text-text px-6 py-3 rounded-custom font-medium transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="relative">
              <CategorySidebar
                categories={categories}
                tags={tags}
                posts={publishedPosts}
                users={users}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}