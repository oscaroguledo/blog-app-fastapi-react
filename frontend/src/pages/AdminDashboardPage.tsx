import { useState, useEffect, useMemo, KeyboardEvent } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { postApi } from '@/api/post';
import { userApi } from '@/api/user';
import { commentApi } from '@/api/comment';
import { contactApi } from '@/api/contact';
import { analyticsApi } from '@/api/analytics';
import { categoryApi, Category } from '@/api/category';
import { Post } from '@/api/post';
import { User } from '@/api/user';
import { Comment } from '@/api/comment';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Users, FileText, MessageSquare, Edit, Power, PowerOff, X, AlertTriangle } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';

export function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users'>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  
  // Pagination state
  const [postsPage, setPostsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const [postsQuery, setPostsQuery] = useState('');
  const [postsSearch, setPostsSearch] = useState('');
  const [usersQuery, setUsersQuery] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsQuery, setContactsQuery] = useState('');
  const [contactsSearch, setContactsSearch] = useState('');
  const itemsPerPage = 10;
  
  // User modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Analytics state
  const [viewsData, setViewsData] = useState<{name: string; views: number}[]>([]);
  const [totalViews, setTotalViews] = useState(0);

  // Fetch posts/users when their tabs are active (server-side search + pagination)
  useEffect(() => {
    if (!(activeTab === 'posts' || activeTab === 'users')) return;

    const fetchData = async () => {
      try {
        const [postsRes, usersRes] = await Promise.all([
          postApi.getAll({ limit: itemsPerPage, offset: (postsPage - 1) * itemsPerPage, search_query: postsSearch || undefined }),
          userApi.getAll({ limit: itemsPerPage, offset: (usersPage - 1) * itemsPerPage, q: usersSearch || undefined }),
        ]);
        if (postsRes.success && postsRes.data) {
          const postsData = Array.isArray(postsRes.data) ? postsRes.data : (postsRes.data.posts || []);
          const postsPagination = postsRes.pagination ?? (postsRes.data && (postsRes.data.pagination || null));
          setPosts(postsData);
          setPostsTotal(postsPagination?.total || postsData.length || 0);
        }
        if (usersRes.success && usersRes.data) {
          const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
          const usersPagination = usersRes.pagination ?? (usersRes.data && (usersRes.data.pagination || null));
          setUsers(usersData);
          setUsersTotal(usersPagination?.total || usersData.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch posts/users for admin tabs:', error);
      }
    };

    fetchData();
  }, [activeTab, postsPage, usersPage, postsSearch, usersSearch]);

  // Overview: fetch totals and full category list independent of posts/users tab state
  useEffect(() => {
    if (activeTab !== 'overview') return;

    const fetchOverview = async () => {
      try {
        const [postsRes, usersRes, commentsRes, categoriesRes, analyticsRes] = await Promise.all([
          postApi.getAll({ limit: 1, offset: 0 }),
          userApi.getAll({ limit: 1, offset: 0 }),
          commentApi.getAll({ limit: 1, offset: 0 }),
          categoryApi.getAll({ limit: 1000, offset: 0 }),
          analyticsApi.getOverview(7)
        ]);

        if (postsRes && postsRes.success) {
          const postsPagination = postsRes.pagination ?? (postsRes.data && (postsRes.data.pagination || null));
          setPostsTotal(postsPagination?.total ?? (Array.isArray(postsRes.data) ? postsRes.data.length : 0));
        }
        if (usersRes && usersRes.success) {
          const usersPagination = usersRes.pagination ?? (usersRes.data && (usersRes.data.pagination || null));
          setUsersTotal(usersPagination?.total ?? (Array.isArray(usersRes.data) ? usersRes.data.length : 0));
        }
        if (commentsRes && commentsRes.success) {
          const commentsPagination = (commentsRes as any).pagination ?? null;
          setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
          setCommentsTotal(commentsPagination?.total ?? (Array.isArray(commentsRes.data) ? commentsRes.data.length : 0));
        }
        if (categoriesRes && categoriesRes.success) {
          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        }
        if (analyticsRes && analyticsRes.success && analyticsRes.data) {
          setTotalViews(analyticsRes.data.total_views);
          setViewsData(analyticsRes.data.daily_stats.map((stat: any) => ({ name: stat.day, views: stat.total_views })));
        }
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
      }
    };

    fetchOverview();
  }, [activeTab]);


  useEffect(() => {
    // Load contacts when contacts tab is active or page changes
    const loadContacts = async () => {
      try {
        const offset = (contactsPage - 1) * itemsPerPage;
        const res = await contactApi.list(itemsPerPage, offset, contactsSearch || undefined);
        if (res.success) {
          setContacts(Array.isArray(res.data) ? res.data : []);
          const total = (res as any).pagination?.total ?? (Array.isArray(res.data) ? res.data.length : 0);
          setContactsTotal(total);
        }
      } catch (e) {
        console.error('Failed to load contacts:', e);
      }
    };

    if (activeTab === 'contacts') {
      loadContacts();
    }
  }, [activeTab, contactsPage, contactsSearch]);

  

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'Admin') {
    navigate('/');
    return null;
  }

  // Build category counts from loaded posts then ensure all categories appear (count 0 if none)
  const categoryCounts = posts.reduce((acc, post) => {
    post.categories.forEach((cat: string) => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryData = (categories.length ? categories.map((c) => ({ name: c.name, count: categoryCounts[c.name] || 0 })) : Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))).sort((a, b) => b.count - a.count);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-text">
              Admin Dashboard
            </h1>
            <p className="text-muted-text mt-1">
              Manage your platform and view analytics.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-border mb-8 overflow-x-auto">
          {['overview', 'posts', 'users', 'contacts'].map((tab) =>
          <Button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            className="capitalize"
          >
            {tab}
          </Button>
          )}
        </div>

        {activeTab === 'overview' &&
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
            {
              label: 'Total Posts',
              value: postsTotal,
              icon: FileText,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10'
            },
            {
              label: 'Total Users',
              value: usersTotal,
              icon: Users,
              color: 'text-green-500',
              bg: 'bg-green-500/10'
            },
            {
              label: 'Total Views',
              value: totalViews.toLocaleString(),
              icon: Eye,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10'
            },
            {
              label: 'Comments',
              value: commentsTotal,
              icon: MessageSquare,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10'
            }].
            map((stat, i) =>
            <div
              key={i}
              className="bg-surface border border-border rounded-custom p-6 flex items-center">
              
                  <div
                className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-text">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-text">{stat.value}</p>
                  </div>
                </div>
            )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-surface border border-border rounded-custom p-6">
                <h3 className="text-lg font-medium text-text mb-6">
                  Traffic Overview (7 days)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsData}>
                      <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false} />
                    
                      <XAxis dataKey="name" stroke="var(--color-muted-text)" />
                      <YAxis stroke="var(--color-muted-text)" />
                      <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }} />
                    
                      <Line
                      type="monotone"
                      dataKey="views"
                      stroke="var(--color-accent)"
                      strokeWidth={3}
                      dot={{
                        r: 4
                      }}
                      activeDot={{
                        r: 6
                      }} />
                    
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-custom p-6">
                <h3 className="text-lg font-medium text-text mb-6">
                  Posts by Category
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false} />
                    
                      <XAxis dataKey="name" stroke="var(--color-muted-text)" />
                      <YAxis stroke="var(--color-muted-text)" />
                      <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                      cursor={{
                        fill: 'var(--color-muted)'
                      }} />
                    
                      <Bar
                      dataKey="count"
                      fill="var(--color-accent)"
                      radius={[4, 4, 0, 0]} />
                    
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        }

        {activeTab === 'posts' &&
        <div className="bg-surface border border-border rounded-custom overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Posts</h3>
              <p className="text-sm text-muted-text">{postsTotal} posts</p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Input
                value={postsQuery}
                onChange={(e) => setPostsQuery((e.target as HTMLInputElement).value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { setPostsSearch(postsQuery); setPostsPage(1); } }}
                placeholder="Search title, excerpt, content"
                className="w-64"
                trailing={<Button type="button" variant="ghost" size="sm" onClick={() => { setPostsQuery(''); setPostsSearch(''); setPostsPage(1); }} title="Clear search"><X size={14} /></Button>}
              />
              <Button size="sm" onClick={() => { setPostsSearch(postsQuery); setPostsPage(1); }}>Search</Button>
            </div>
          </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {posts.map((post) => {
                  const author = users.find((u) => u.id === post.authorId);
                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-muted/20 transition-colors">
                      
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text truncate max-w-xs">
                            {post.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar
                              src={author?.avatar}
                              alt={`${author?.firstName} ${author?.lastName}`}
                              size="sm"
                              className="mr-2"
                            />

                            <div className="text-sm text-text">
                              {author?.firstName} {author?.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-custom ${post.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          
                            {post.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-text">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user?.id === post.authorId && (
                            <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover p-1">
                              <Edit size={16} />
                            </Button>
                          )}
                          {(user?.id === post.authorId || user?.role === 'Admin') && (
                            <Button
                              onClick={async () => {
                                await postApi.delete(post.id);
                                setPosts(posts.filter(p => p.id !== post.id));
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {posts.map((post) => {
                const author = users.find((u) => u.id === post.authorId);
                return (
                  <div key={post.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium text-text line-clamp-2 flex-1 mr-2">
                        {post.title}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-custom shrink-0 ${post.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar src={author?.avatar} alt={`${author?.firstName} ${author?.lastName}`} size="sm" />
                      <span className="text-sm text-muted-text">{author?.firstName} {author?.lastName}</span>
                    </div>
                    <div className="text-xs text-muted-text">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 pt-2">
                      {user?.id === post.authorId && (
                        <Button variant="outline" size="sm" className="flex-1 text-accent">
                          <Edit size={14} className="mr-1" /> Edit
                        </Button>
                      )}
                      {(user?.id === post.authorId || user?.role === 'Admin') && (
                        <Button 
                          onClick={async () => {
                            await postApi.delete(post.id);
                            setPosts(posts.filter(p => p.id !== post.id));
                          }}
                          variant="outline" 
                          size="sm" 
                          className={user?.id === post.authorId ? "text-red-500" : "flex-1 text-red-500"}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Posts Pagination */}
            <div className="px-6 py-4 border-t border-border">
              <Pagination
                limit={itemsPerPage}
                offset={(postsPage - 1) * itemsPerPage}
                total={postsTotal}
                onPageChange={(offset) => setPostsPage(Math.floor(offset / itemsPerPage) + 1)}
              />
            </div>
          </div>
        }

        {activeTab === 'users' &&
        <div className="bg-surface border border-border rounded-custom overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Users</h3>
              <p className="text-sm text-muted-text">{usersTotal} users</p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Input
                value={usersQuery}
                onChange={(e) => setUsersQuery((e.target as HTMLInputElement).value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { setUsersSearch(usersQuery); setUsersPage(1); } }}
                placeholder="Search name or email"
                className="w-64"
                trailing={<Button type="button" variant="ghost" size="sm" onClick={() => { setUsersQuery(''); setUsersSearch(''); setUsersPage(1); }} title="Clear search"><X size={14} /></Button>}
              />
              <Button size="sm" onClick={() => { setUsersSearch(usersQuery); setUsersPage(1); }}>Search</Button>
            </div>
          </div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {users.map((u) =>
                <tr
                  key={u.id}
                  className="hover:bg-muted/20 transition-colors">
                  
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={u.avatar}
                            alt={`${u.firstName} ${u.lastName}`}
                            size="sm"
                            className="mr-3"
                          />

                          <div>
                            <div className="text-sm font-medium text-text">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-sm text-muted-text">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-custom ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-accent hover:text-accent-hover p-1 mr-2"
                          title="View Details"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowUserModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        {u.active ? (
                          <Button 
                            onClick={async () => {
                              await userApi.deactivate(u.id);
                              setUsers(users.map(user => user.id === u.id ? { ...user, active: false } : user));
                            }}
                            variant="ghost" 
                            size="sm" 
                            className="text-orange-500 hover:text-orange-600 p-1 mr-2"
                            title="Deactivate"
                          >
                            <PowerOff size={16} />
                          </Button>
                        ) : (
                          <Button 
                            onClick={async () => {
                              await userApi.activate(u.id);
                              setUsers(users.map(user => user.id === u.id ? { ...user, active: true } : user));
                            }}
                            variant="ghost" 
                            size="sm" 
                            className="text-green-500 hover:text-green-600 p-1 mr-2"
                            title="Activate"
                          >
                            <Power size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => {
                            setUserToDelete(u);
                            setShowDeleteModal(true);
                          }}
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} alt={`${u.firstName} ${u.lastName}`} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-muted-text truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-custom ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {u.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-accent"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowUserModal(true);
                      }}
                    >
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    {u.active ? (
                      <Button 
                        onClick={async () => {
                          await userApi.deactivate(u.id);
                          setUsers(users.map(user => user.id === u.id ? { ...user, active: false } : user));
                        }}
                        variant="outline" 
                        size="sm" 
                        className="text-orange-500"
                      >
                        <PowerOff size={14} />
                      </Button>
                    ) : (
                      <Button 
                        onClick={async () => {
                          await userApi.activate(u.id);
                          setUsers(users.map(user => user.id === u.id ? { ...user, active: true } : user));
                        }}
                        variant="outline" 
                        size="sm" 
                        className="text-green-500"
                      >
                        <Power size={14} />
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        setUserToDelete(u);
                        setShowDeleteModal(true);
                      }}
                      variant="outline" 
                      size="sm" 
                      className="text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Users Pagination */}
            <div className="px-6 py-4 border-t border-border">
              <Pagination
                limit={itemsPerPage}
                offset={(usersPage - 1) * itemsPerPage}
                total={usersTotal}
                onPageChange={(offset) => setUsersPage(Math.floor(offset / itemsPerPage) + 1)}
              />
            </div>
          </div>
        }

        {activeTab === 'contacts' &&
          <div className="bg-surface border border-border rounded-custom overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text">Contact Messages</h3>
                <p className="text-sm text-muted-text">{contactsTotal} messages</p>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                  <Input
                    value={contactsQuery}
                    onChange={(e) => { setContactsQuery((e.target as HTMLInputElement).value); setContactsPage(1); }}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { setContactsSearch(contactsQuery); setContactsPage(1); } }}
                    placeholder="Search name, email, subject or message"
                    className="w-64"
                    trailing={<Button type="button" variant="ghost" size="sm" onClick={() => { setContactsQuery(''); setContactsSearch(''); setContactsPage(1); }} title="Clear search"><X size={14} /></Button>}
                  />
                  <Button size="sm" onClick={() => { setContactsSearch(contactsQuery); setContactsPage(1); }}>Search</Button>
            
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!confirm('Mark all messages as read? This cannot be undone.')) return;
                    // optimistic update
                    setContacts((prev) => prev.map(c => ({ ...c, isRead: true })));
                    const unread = contacts.filter(c => !c.isRead).map(c => c.id);
                    for (const id of unread) {
                      try { await contactApi.markRead(id); } catch (e) { console.error('markAllRead failed', e); }
                    }
                  }}
                >Mark all read</Button>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-text uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {contacts.map((m) => (
                    <tr key={m.id} className={m.isRead ? 'opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{m.subject || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm max-w-2xl truncate">{m.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!m.isRead && (
                          <Button onClick={async () => {
                            await contactApi.markRead(m.id);
                            setContacts(contacts.map(c => c.id === m.id ? { ...c, isRead: true } : c));
                          }} variant="ghost" size="sm">Mark read</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-border">
              {contacts.map((m) => (
                <div key={m.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-text line-clamp-2">{m.name}</div>
                    <div className="text-xs text-muted-text">{new Date(m.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-muted-text">{m.email}</div>
                  <div className="text-sm">{m.subject || '-'}</div>
                  <div className="text-sm truncate">{m.message}</div>
                  {!m.isRead && (
                    <div className="pt-2">
                      <Button onClick={async () => {
                        await contactApi.markRead(m.id);
                        setContacts(contacts.map(c => c.id === m.id ? { ...c, isRead: true } : c));
                      }} variant="outline" size="sm">Mark read</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border">
              <Pagination
                limit={itemsPerPage}
                offset={(contactsPage - 1) * itemsPerPage}
                total={contactsTotal}
                onPageChange={(offset) => setContactsPage(Math.floor(offset / itemsPerPage) + 1)}
              />
            </div>
          </div>
        }

      </div>
      
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUserModal(false)} />
          <div className="relative bg-surface rounded-custom border border-border shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text">User Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserModal(false)}
                className="p-2"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={selectedUser.avatar}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  size="lg"
                />
                <div>
                  <h4 className="text-xl font-semibold text-text">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-sm text-muted-text">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-text">Role:</span>
                  <span className="text-sm font-medium text-text">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-text">Status:</span>
                  <span className={`text-sm font-medium ${selectedUser.active ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedUser.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-text">Verified:</span>
                  <span className={`text-sm font-medium ${selectedUser.isVerified ? 'text-green-500' : 'text-orange-500'}`}>
                    {selectedUser.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                {selectedUser.bio && (
                  <div>
                    <span className="text-sm text-muted-text block mb-1">Bio:</span>
                    <p className="text-sm text-text">{selectedUser.bio}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-text">Joined at:</span>
                  <span className="text-sm text-text">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }} />
          <div className="relative bg-surface rounded-custom border border-border shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="text-lg font-semibold text-text">Delete User</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="p-2"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-text">
                Are you sure you want to delete {userToDelete.firstName} {userToDelete.lastName}? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={async () => {
                  await userApi.delete(userToDelete.id);
                  setUsers(users.filter(user => user.id !== userToDelete.id));
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>);

}