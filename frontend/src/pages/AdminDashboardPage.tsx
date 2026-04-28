import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { postApi } from '@/api/post';
import { userApi } from '@/api/user';
import { commentApi } from '@/api/comment';
import { Post } from '@/api/post';
import { User } from '@/api/user';
import { Comment } from '@/api/comment';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, Users, FileText, MessageSquare, Edit } from 'lucide-react';
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
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Pagination state
  const [postsPage, setPostsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, usersRes, commentsRes] = await Promise.all([
          postApi.getAll({ limit: itemsPerPage, offset: (postsPage - 1) * itemsPerPage }),
          userApi.getAll({ limit: itemsPerPage, offset: (usersPage - 1) * itemsPerPage }),
          commentApi.getAll({ limit: 100, offset: 0 })
        ]);
        if (postsRes.success && postsRes.data) {
          const postsData = 'posts' in postsRes.data ? postsRes.data.posts : postsRes.data;
          const postsPagination = 'pagination' in postsRes.data ? postsRes.data.pagination : null;
          setPosts(postsData);
          setPostsTotal(postsPagination?.total || postsData.length || 0);
        }
        if (usersRes.success && usersRes.data) {
          const userDataAny = usersRes.data as any;
          const usersData = Array.isArray(userDataAny) ? userDataAny : userDataAny.users || [];
          const usersPagination = !Array.isArray(userDataAny) ? userDataAny.pagination : null;
          setUsers(usersData);
          setUsersTotal(usersPagination?.total || usersData.length || 0);
        }
        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data.comments || commentsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [postsPage, usersPage]);
  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'Admin') {
    navigate('/');
    return null;
  }
  // Mock Analytics Data
  const viewsData = [
  {
    name: 'Mon',
    views: 4000
  },
  {
    name: 'Tue',
    views: 3000
  },
  {
    name: 'Wed',
    views: 2000
  },
  {
    name: 'Thu',
    views: 2780
  },
  {
    name: 'Fri',
    views: 1890
  },
  {
    name: 'Sat',
    views: 2390
  },
  {
    name: 'Sun',
    views: 3490
  }];

  // Calculate category data from posts
  const categoryCounts = posts.reduce((acc, post) => {
    post.categories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 categories

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
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
          {['overview', 'posts', 'users'].map((tab) =>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
            {
              label: 'Total Posts',
              value: posts.length,
              icon: FileText,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10'
            },
            {
              label: 'Total Users',
              value: users.length,
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
              value: comments.length,
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
                          <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover p-1">
                            <Edit size={16} />
                          </Button>
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
                      <Button variant="outline" size="sm" className="flex-1 text-accent">
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      <Button 
                        onClick={async () => {
                          await postApi.delete(post.id);
                          setPosts(posts.filter(p => p.id !== post.id));
                        }}
                        variant="outline" 
                        size="sm" 
                        className="text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
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
                      Followers
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-text">
                        {(u.followers ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover mr-3 p-1">
                          Edit
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
                    <span className="text-xs text-muted-text">
                      {(u.followers ?? 0).toLocaleString()} followers
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full text-accent">
                      <Edit size={14} className="mr-1" /> Edit User
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
      </div>
    </Layout>);

}