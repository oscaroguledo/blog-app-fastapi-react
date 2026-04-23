import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { useBlog } from '@/contexts/BlogContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, X, SlidersHorizontal } from 'lucide-react';
export function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, categories, tags, users, getAuthor, getPaginatedPosts } = useBlog();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialTag = searchParams.get('tag') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>('recent');
  const [showFilters, setShowFilters] = useState(!!(initialCategory || initialTag));
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;
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
    setCurrentPage(1);
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

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
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
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, topics, authors..."
              className="pl-12 pr-24 bg-surface text-base"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-muted-text" />
            </div>
            {query &&
            <Button
              type="button"
              onClick={() => setQuery('')}
              variant="ghost"
              size="sm"
              className="absolute inset-y-0 right-14 px-2"
            >
              <X size={18} />
            </Button>
            }
            <Button
              type="submit"
              // variant="ghost"
              size="sm"
              className="absolute inset-y-0 right-0 px-4 font-medium"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Filter Toggle & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters || activeFilterCount > 0 ? 'outline' : 'outline'}
              size="sm"
              className={`flex items-center gap-2 ${showFilters || activeFilterCount > 0 ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-text hover:border-accent hover:text-accent'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 &&
              <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              }
            </Button>

            {hasActiveFilters &&
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-muted-text hover:text-accent"
            >
              Clear all
            </Button>
            }
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-text">Sort by:</span>
            <Dropdown
              value={sortBy}
              onChange={(value) => setSortBy(value as 'recent' | 'popular' | 'oldest')}
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'oldest', label: 'Oldest First' }
              ]}
              className="w-40"
            />
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
            
              <div className="bg-surface border border-border rounded-custom p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                    onClick={() => setSelectedCategory('')}
                    variant={!selectedCategory ? 'primary' : 'secondary'}
                    size="sm"
                    className="rounded-full"
                    >
                      All
                    </Button>
                    {categories.map((cat) =>
                  <Button
                    key={cat}
                    onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat ? '' : cat
                    )
                    }
                    variant={selectedCategory === cat ? 'primary' : 'secondary'}
                    size="sm"
                    className="rounded-full"
                    >
                        {cat}
                      </Button>
                  )}
                  </div>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Tag
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                    onClick={() => setSelectedTag('')}
                    variant={!selectedTag ? 'primary' : 'secondary'}
                    size="sm"
                    className="rounded-full"
                    >
                      All
                    </Button>
                    {tags.map((tag) =>
                  <Button
                    key={tag}
                    onClick={() =>
                    setSelectedTag(selectedTag === tag ? '' : tag)
                    }
                    variant={selectedTag === tag ? 'primary' : 'secondary'}
                    size="sm"
                    className="rounded-full"
                    >
                        #{tag}
                      </Button>
                  )}
                  </div>
                </div>

                {/* Author Filter */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Author
                  </label>
                  <div className="space-y-2">
                    <Button
                    onClick={() => setSelectedAuthor('')}
                    variant={!selectedAuthor ? 'outline' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start ${!selectedAuthor ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-muted/50 text-muted-text hover:bg-muted'}`}
                    >
                      All Authors
                    </Button>
                    {users.map((author) =>
                  <Button
                    key={author.id}
                    onClick={() =>
                    setSelectedAuthor(
                      selectedAuthor === author.id ? '' : author.id
                    )
                    }
                    variant={selectedAuthor === author.id ? 'outline' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start ${selectedAuthor === author.id ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-muted/50 text-muted-text hover:bg-muted'}`}
                    >
                        <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-6 h-6 rounded-full mr-2" />
                        {author.name}
                      </Button>
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
                <Button onClick={() => setQuery('')} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
              </span>
          }
            {selectedCategory &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {selectedCategory}
                <Button onClick={() => setSelectedCategory('')} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
              </span>
          }
            {selectedTag &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                #{selectedTag}
                <Button onClick={() => setSelectedTag('')} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
              </span>
          }
            {selectedAuthor &&
          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {users.find((u) => u.id === selectedAuthor)?.name}
                <Button onClick={() => setSelectedAuthor('')} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
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
        {paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                author={getAuthor(post.authorId)!} 
                index={index} 
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
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
            <Button
              onClick={clearAllFilters}
              variant="primary"
              size="sm"
              className="rounded-full"
            >
              Clear all filters
            </Button>
          </motion.div>
        )}

        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>);
}