import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useBlog } from '../contexts/BlogContext';
import { useNavigate } from 'react-router-dom';
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
import { Users, FileText, Eye, MessageSquare, Edit, Trash2 } from 'lucide-react';
export function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { posts, users, comments, deletePost } = useBlog();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users'>(
    'overview'
  );
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

  const categoryData = [
  {
    name: 'Tech',
    count: 40
  },
  {
    name: 'Design',
    count: 30
  },
  {
    name: 'Business',
    count: 20
  },
  {
    name: 'Life',
    count: 10
  }];

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
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-accent text-accent' : 'text-muted-text hover:text-text hover:bg-muted/50'}`}>
            
              {tab}
            </button>
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
              className="bg-surface border border-border rounded-xl p-6 flex items-center">
              
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
              <div className="bg-surface border border-border rounded-xl p-6">
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

              <div className="bg-surface border border-border rounded-xl p-6">
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
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
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
                            <img
                            className="h-6 w-6 rounded-full mr-2"
                            src={author?.avatar}
                            alt="" />
                          
                            <div className="text-sm text-text">
                              {author?.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          
                            {post.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-text">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-accent hover:text-accent-hover mr-3">
                            <Edit size={16} />
                          </button>
                          <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-500 hover:text-red-700">
                          
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
          </div>
        }

        {activeTab === 'users' &&
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
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
                          <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={u.avatar}
                        alt="" />
                      
                          <div>
                            <div className="text-sm font-medium text-text">
                              {u.name}
                            </div>
                            <div className="text-sm text-muted-text">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-text">
                        {u.followers.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-accent hover:text-accent-hover mr-3">
                          Edit
                        </button>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </Layout>);

}