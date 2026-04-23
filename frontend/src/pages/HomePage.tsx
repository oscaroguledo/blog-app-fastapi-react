import React from 'react';
import { Layout } from '../components/Layout';
import { FeaturedPost } from '../components/FeaturedPost';
import { PostCard } from '../components/PostCard';
import { CategorySidebar } from '../components/CategorySidebar';
import { useBlog } from '../contexts/BlogContext';
import { motion } from 'framer-motion';
export function HomePage() {
  const { posts, categories, tags, users, getAuthor } = useBlog();
  const publishedPosts = posts.filter((p) => p.isPublished);
  const featuredPost =
  publishedPosts.find((p) => p.featured) || publishedPosts[0];
  const recentPosts = publishedPosts.
  filter((p) => p.id !== featuredPost?.id).
  slice(0, 6);
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        {featuredPost &&
        <section className="mb-12 md:mb-16">
            <FeaturedPost post={featuredPost} author={getAuthor(featuredPost.authorId)} />
          </section>
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Post Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-bold text-text">
                Latest Articles
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {recentPosts.map((post, index) =>
              <PostCard 
                key={post.id} 
                post={post} 
                author={getAuthor(post.authorId)} 
                index={index} 
              />
              )}
            </div>

            {publishedPosts.length > 7 &&
            <div className="mt-10 text-center">
                <button className="bg-surface border border-border hover:border-accent text-text px-6 py-3 rounded-full font-medium transition-colors">
                  Load More Posts
                </button>
              </div>
            }
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
    </Layout>);

}