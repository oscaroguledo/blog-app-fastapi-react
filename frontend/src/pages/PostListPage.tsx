import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { PostListPageSkeleton } from '@/components/PostListPageSkeleton';
import { useBlog } from '@/contexts/BlogContext';
import { postApi } from '@/api/post';
import { Post } from '@/api/post';
import { motion } from 'framer-motion';
import { SearchIcon, X, Filter } from 'lucide-react';

export function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, users, getAuthor } = useBlog();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialAuthor = searchParams.get('author') || '';
  const initialSort = (searchParams.get('sort') as 'recent' | 'popular' | 'oldest') || 'recent';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedAuthor, setSelectedAuthor] = useState<string[]>(initialAuthor ? [initialAuthor] : []);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>(initialSort);
  const [offset, setOffset] = useState(0);
  const [openModal, setOpenModal] = useState<'category' | 'author' | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 9;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.getAll({
          search_query: query || undefined,
          category_name: selectedCategory[0] || undefined,
          author_id: selectedAuthor[0] || undefined,
          sort_by: sortBy || undefined,
          is_published: true,
          limit,
          offset
        });
        if (response.success && response.data) {
          // Handle both response structures: {posts, pagination} or direct array
          const postsData = response.data.posts || response.data;
          const totalCount = response.data.pagination?.total || postsData.length;
          setPosts(Array.isArray(postsData) ? postsData : []);
          setTotal(totalCount);
        } else {
          setPosts([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [query, selectedCategory, selectedAuthor, offset, limit, sortBy]);

  if (loading) {
    return <PostListPageSkeleton />;
  }

  const doSearch = () => {
    setOffset(0);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (selectedCategory.length > 0) params.category = selectedCategory.join(',');
    if (selectedAuthor.length > 0) params.author = selectedAuthor.join(',');
    if (sortBy) params.sort = sortBy;
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch();
  };
  const hasActiveFilters = !!(
  query ||
  selectedCategory.length > 0 ||
  selectedAuthor.length > 0);
  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategory([]);
    setSelectedAuthor([]);
    setSortBy('recent');
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-text mb-2">
            {initialCategory ?
            initialCategory :
            'Search'}
          </h1>
          <p className="text-muted-text">
            {initialCategory ?
            `Explore articles in ${initialCategory}` :
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
              onKeyDown={(e) => { if ((e as React.KeyboardEvent).key === 'Enter') { e.preventDefault(); doSearch(); } }}
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
              onClick={(e) => { e.preventDefault(); doSearch(); }}
            >
              Search
            </Button>
          </div>
        </form>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            onClick={() => setOpenModal('category')}
            variant={selectedCategory.length > 0 ? 'primary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Category
            {selectedCategory.length > 0 && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{selectedCategory.length}</span>}
          </Button>
          <Button
            onClick={() => setOpenModal('author')}
            variant={selectedAuthor.length > 0 ? 'primary' : 'outline'}
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Author
            {selectedAuthor.length > 0 && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{selectedAuthor.length}</span>}
          </Button>
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
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-muted-text hover:text-accent"
            >
              Clear all
            </Button>
          )}
        </div>

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
            {selectedCategory.map((cat) =>
          <span key={cat} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {cat}
                <Button onClick={() => setSelectedCategory(selectedCategory.filter(c => c !== cat))} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
              </span>
          )}
            {selectedAuthor.map((authorId) =>
          <span key={authorId} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {users.find((u) => u.id === authorId)?.firstName} {users.find((u) => u.id === authorId)?.lastName}
                <Button onClick={() => setSelectedAuthor(selectedAuthor.filter(a => a !== authorId))} variant="ghost" size="sm" className="p-0 h-auto">
                  <X size={14} />
                </Button>
              </span>
          )}
          </div>
        }

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-text">
            {total}{' '}
            {total === 1 ? 'article' : 'articles'} found
          </p>
        </div>

        {/* Results Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post: Post, index: number) => (
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
            limit={limit}
            offset={offset}
            total={total}
            onPageChange={setOffset}
          />
        </div>

        {/* Filter Modals */}
        <Modal
          isOpen={openModal === 'category'}
          onClose={() => setOpenModal(null)}
          title="Select Categories"
          options={categories}
          selected={selectedCategory}
          onSelect={(value) => {
            if (selectedCategory.includes(value)) {
              setSelectedCategory(selectedCategory.filter(c => c !== value));
            } else {
              setSelectedCategory([...selectedCategory, value]);
            }
          }}
          onClear={() => setSelectedCategory([])}
          multiSelect
        />

        <Modal
          isOpen={openModal === 'author'}
          onClose={() => setOpenModal(null)}
          title="Select Authors"
          options={users.map(u => `${u.firstName} ${u.lastName}`)}
          selected={selectedAuthor.map(id => `${users.find(u => u.id === id)?.firstName} ${users.find(u => u.id === id)?.lastName}` || '')}
          onSelect={(value) => {
            const author = users.find(u => `${u.firstName} ${u.lastName}` === value);
            if (!author) return;
            if (selectedAuthor.includes(author.id)) {
              setSelectedAuthor(selectedAuthor.filter(id => id !== author.id));
            } else {
              setSelectedAuthor([...selectedAuthor, author.id]);
            }
          }}
          onClear={() => setSelectedAuthor([])}
          multiSelect
        />
      </div>
    </Layout>);
}