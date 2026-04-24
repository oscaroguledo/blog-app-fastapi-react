import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { User } from '@/api/user';
import { Post } from '@/api/post';

interface CategoryItem {
  name: string;
  count: number;
}

interface CategorySidebarProps {
  categories: string[];
  posts: Post[];
  users: User[];
}

export function CategorySidebar({ categories, posts, users }: CategorySidebarProps) {
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
              alt={`${author.firstName} ${author.lastName}`}
              className="h-10 w-10 rounded-full border border-border" />
            
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-text">{author.firstName} {author.lastName}</p>
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