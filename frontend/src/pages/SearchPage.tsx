import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PostCard } from '../components/PostCard';
import { useBlog } from '../contexts/BlogContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, categories, tags, users, getAuthor } = useBlog();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialTag = searchParams.get('tag') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>(
    'recent'
  );
  const [showFilters, setShowFilters] = useState(
    !!(initialCategory || initialTag)
  );
  const publishedPosts = posts.filter((p) => p.isPublished);
  const filteredPosts = useMemo(() => {
    let results = [...publishedPosts];
    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.categories.some((c) => c.toLowerCase().includes(q))
      );
    }
    // Category filter
    if (selectedCategory) {
      results = results.filter((post) =>
      post.categories.includes(selectedCategory)
      );
    }
    // Tag filter
    if (selectedTag) {
      results = results.filter((post) => post.tags.includes(selectedTag));
    }
    // Author filter
    if (selectedAuthor) {
      results = results.filter((post) => post.authorId === selectedAuthor);
    }
    // Sort
    if (sortBy === 'recent') {
      results.sort(
        (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'popular') {
      results.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'oldest') {
      results.sort(
        (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return results;
  }, [
  publishedPosts,
  query,
  selectedCategory,
  selectedTag,
  selectedAuthor,
  sortBy]
  );
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    setSearchParams(params);
  };
  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setSelectedAuthor('');
    setSortBy('recent');
    setSearchParams({});
  };
  const hasActiveFilters = !!(
  query ||
  selectedCategory ||
  selectedTag ||
  selectedAuthor);

  const activeFilterCount = [
  selectedCategory,
  selectedTag,
  selectedAuthor].
  filter(Boolean).length;
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-text mb-2">
            {initialCategory ?
            initialCategory :
            initialTag ?
            `#${initialTag}` :
            'Search'}
          </h1>
          <p className="text-muted-text">
            {initialCategory ?
            `Explore articles in ${initialCategory}` :
            initialTag ?
            `Articles tagged with ${initialTag}` :
            'Find articles, topics, and authors'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-muted-text" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, topics, authors..."
              className="w-full pl-12 pr-12 py-3.5 bg-surface border border-border rounded-xl text-text placeholder-muted-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base transition-colors" />
            
            {query &&
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-14 flex items-center px-2 text-muted-text hover:text-text">
              
                <X size={18} />
              </button>
            }
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center px-4 text-accent hover:text-accent-hover font-medium text-sm">
              
              Search
            </button>
          </div>
        </form>

        {/* Filter Toggle & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-text hover:border-accent hover:text-accent'}`}>
              
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 &&
              <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              }
            </button>

            {hasActiveFilters &&
            <button
              onClick={clearAllFilters}
              className="text-sm text-muted-text hover:text-accent transition-colors">
              
                Clear all
              </button>
            }
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-text">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                setSortBy(e.target.value as 'recent' | 'popular' | 'oldest')
                }
                className="appearance-none bg-surface border border-border rounded-lg pl-3 pr-8 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer">
                
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
              
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters &&
          <motion.div
            initial={{
              height: 0,
              opacity: 0
            }}
            animate={{
              height: 'auto',
              opacity: 1
            }}
            exit={{
              height: 0,
              opacity: 0
            }}
            transition={{
              duration: 0.25
            }}
            className="overflow-hidden mb-8">
            
              <div className="bg-surface border border-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${!selectedCategory ? 'bg-accent text-white' : 'bg-muted text-muted-text hover:text-text'}`}>
                    
                      All
                    </button>
                    {categories.map((cat) =>
                  <button
                    key={cat}
                    onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat ? '' : cat
                    )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedCategory === cat ? 'bg-accent text-white' : 'bg-muted text-muted-text hover:text-text'}`}>
                    
                        {cat}
                      </button>
                  )}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tag
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                    onClick={() => setSelectedTag('')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${!selectedTag ? 'bg-accent text-white' : 'bg-muted text-muted-text hover:text-text'}`}>
                    
                      All
                    </button>
                    {tags.map((tag) =>
                  <button
                    key={tag}
                    onClick={() =>
                    setSelectedTag(selectedTag === tag ? '' : tag)
                    }
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTag === tag ? 'bg-accent text-white' : 'bg-muted text-muted-text hover:text-text'}`}>
                    
                        #{tag}
                      </button>
                  )}
                  </div>
                </div>

                {/* Author Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Author
                  </label>
                  <div className="space-y-2">
                    <button
                    onClick={() => setSelectedAuthor('')}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${!selectedAuthor ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-muted/50 text-muted-text hover:bg-muted'}`}>
                    
                      All Authors
                    </button>
                    {users.map((author) =>
                  <button
                    key={author.id}
                    onClick={() =>
                    setSelectedAuthor(
                      selectedAuthor === author.id ? '' : author.id
                    )
                    }
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${selectedAuthor === author.id ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-muted/50 text-muted-text hover:bg-muted'}`}>
                    
                        <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-6 h-6 rounded-full mr-2" />
                    
                        {author.name}
                      </button>
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Active Filter Pills */}
        {hasActiveFilters &&
        <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-sm text-muted-text">Active:</span>
            {query &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                "{query}"
                <button onClick={() => setQuery('')}>
                  <X size={14} />
                </button>
              </span>
          }
            {selectedCategory &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <X size={14} />
                </button>
              </span>
          }
            {selectedTag &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                #{selectedTag}
                <button onClick={() => setSelectedTag('')}>
                  <X size={14} />
                </button>
              </span>
          }
            {selectedAuthor &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {users.find((u) => u.id === selectedAuthor)?.name}
                <button onClick={() => setSelectedAuthor('')}>
                  <X size={14} />
                </button>
              </span>
          }
          </div>
        }

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-text">
            {filteredPosts.length}{' '}
            {filteredPosts.length === 1 ? 'article' : 'articles'} found
          </p>
        </div>

        {/* Results Grid */}
        {filteredPosts.length > 0 ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post, index) =>
          <PostCard 
            key={post.id} 
            post={post} 
            author={getAuthor(post.authorId)} 
            index={index} 
          />
          )}
          </div> :

        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="text-center py-20">
          
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <SearchIcon size={28} className="text-muted-text" />
            </div>
            <h3 className="text-xl font-serif font-bold text-text mb-2">
              No articles found
            </h3>
            <p className="text-muted-text max-w-md mx-auto mb-6">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
            <button
            onClick={clearAllFilters}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
            
              Clear all filters
            </button>
          </motion.div>
        }
      </div>
    </Layout>);

}