import React from 'react';
import { Link } from 'react-router-dom';
import { User, Post } from '../data/mockData';

interface CategoryItem {
  name: string;
  count: number;
}

interface CategorySidebarProps {
  categories: string[];
  tags: string[];
  posts: Post[];
  users: User[];
}

export function CategorySidebar({ categories, tags, posts, users }: CategorySidebarProps) {
  // Calculate post counts per category
  const categoryCounts: CategoryItem[] = categories.
  map((category) => ({
    name: category,
    count: posts.filter((p) => p.categories.includes(category)).length
  })).
  sort((a, b) => b.count - a.count);
  // Get top authors
  const topAuthors = [...users].
  sort((a, b) => b.followers - a.followers).
  slice(0, 3);
  return (
    <aside className="space-y-8">
      {/* Categories */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-serif font-bold text-text mb-4">
          Discover More
        </h3>
        <ul className="space-y-3">
          {categoryCounts.map((category) =>
          <li key={category.name}>
              <Link
              to={`/search?category=${category.name}`}
              className="flex items-center justify-between group">
              
                <span className="text-muted-text group-hover:text-accent transition-colors">
                  {category.name}
                </span>
                <span className="bg-muted text-muted-text text-xs font-medium px-2 py-1 rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                  {category.count}
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Popular Tags */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-serif font-bold text-text mb-4">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) =>
          <Link
            key={tag}
            to={`/search?tag=${tag}`}
            className="inline-block bg-muted hover:bg-accent hover:text-white text-muted-text text-sm px-3 py-1.5 rounded-full transition-colors">
            
              {tag}
            </Link>
          )}
        </div>
      </div>

      {/* Trending Authors */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-serif font-bold text-text mb-4">
          Trending Authors
        </h3>
        <ul className="space-y-4">
          {topAuthors.map((author) =>
          <li key={author.id} className="flex items-center">
              <img
              src={author.avatar}
              alt={author.name}
              className="h-10 w-10 rounded-full border border-border" />
            
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-text">{author.name}</p>
                <p className="text-xs text-muted-text">{author.role}</p>
              </div>
              <button className="text-xs font-medium text-accent hover:text-accent-hover border border-accent hover:bg-accent hover:text-white px-3 py-1 rounded-full transition-colors">
                View All
              </button>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}