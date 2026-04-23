import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Settings, Eye, Edit2, Check } from 'lucide-react';
export function WritePage() {
  const { isAuthenticated, user } = useAuth();
  const { addPost, categories, tags } = useBlog();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [coverImage, setCoverImage] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // Redirect if not logged in
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  const handlePublish = () => {
    if (!title || !content) return;
    setIsPublishing(true);
    setTimeout(() => {
      addPost({
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + '...',
        coverImage: coverImage || 'https://picsum.photos/seed/new/1200/600',
        authorId: user!.id,
        categories: [selectedCategory],
        tags: ['New'],
        readingTime: Math.ceil(content.split(' ').length / 200),
        isPublished: true
      });
      setIsPublishing(false);
      navigate('/');
    }, 1000);
  };
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsPreview(false)}
              variant={!isPreview ? 'secondary' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <Edit2 size={16} className="mr-2" /> Write
            </Button>
            <Button
              onClick={() => setIsPreview(true)}
              variant={isPreview ? 'secondary' : 'ghost'}
              size="sm"
              className="flex items-center"
            >
              <Eye size={16} className="mr-2" /> Preview
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings size={20} />
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !title || !content}
              variant="primary"
              size="md"
              className="flex items-center"
            >
              {isPublishing ? 'Publishing...' : <><Check size={16} className="mr-2" /> Publish</>}
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-grow flex flex-col md:flex-row gap-8 overflow-hidden">
          {/* Main Editor */}
          <div className="flex-grow flex flex-col overflow-y-auto pr-2 custom-scrollbar">
            {!isPreview ?
            <>
                <Input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-muted-text mb-6"
                />

                <textarea
                placeholder="Tell your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-grow text-lg bg-transparent border-none focus:outline-none focus:ring-0 text-text placeholder-muted-text resize-none min-h-[400px]" />
              
              </> :

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h1>{title || 'Untitled'}</h1>
                <div
                dangerouslySetInnerHTML={{
                  __html:
                  content.replace(/\n/g, '<br/>') ||
                  '<em>Nothing to preview yet.</em>'
                }} />
              
              </div>
            }
          </div>

          {/* Settings Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar border-l border-border pl-6 hidden md:block">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Cover Image URL
              </label>
              <Input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="text-sm"
              />
              {coverImage &&
              <img
                src={coverImage}
                alt="Cover preview"
                className="mt-3 w-full h-32 object-cover rounded-custom border border-border" />

              }
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Category
              </label>
              <Dropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categories.map((cat) => ({ value: cat, label: cat }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary for post cards..."
                className="w-full bg-background border border-border rounded-custom px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none h-24 text-text" />
              
            </div>
          </div>
        </div>
      </div>
    </Layout>);

}