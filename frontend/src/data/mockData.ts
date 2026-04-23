export type Role = 'Writer' | 'Editor' | 'Admin' | 'Reader';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: Role;
  bio: string;
  followers: number;
  following: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  categories: string[];
  tags: string[];
  createdAt: string;
  readingTime: number;
  likes: number;
  views: number;
  isPublished: boolean;
  featured?: boolean;
}

export const mockUsers: User[] = [
{
  id: 'u1',
  firstName: 'Elena',
  lastName: 'Rostova',
  email: 'elena@example.com',
  avatar: 'https://i.pravatar.cc/150?u=u1',
  role: 'Admin',
  bio: 'Chief Editor and Tech Enthusiast. Writing about the future of web development.',
  followers: 12500,
  following: 340
},
{
  id: 'u2',
  firstName: 'Marcus',
  lastName: 'Chen',
  email: 'marcus@example.com',
  avatar: 'https://i.pravatar.cc/150?u=u2',
  role: 'Writer',
  bio: 'UX Designer turned Frontend Developer. I build things that look good and work well.',
  followers: 8430,
  following: 120
},
{
  id: 'u3',
  firstName: 'Sarah',
  lastName: 'Jenkins',
  email: 'sarah@example.com',
  avatar: 'https://i.pravatar.cc/150?u=u3',
  role: 'Writer',
  bio: 'Data Scientist exploring AI and Machine Learning applications in everyday life.',
  followers: 5200,
  following: 450
}];


export const mockCategories = [
'Technology',
'Design',
'Business',
'Lifestyle',
'Science',
'AI'];

export const mockTags = [
'React',
'TypeScript',
'UI/UX',
'Productivity',
'Web Dev',
'Machine Learning',
'Startups',
'Career'];


export const mockPosts: Post[] = [
{
  id: 'p1',
  title: 'The Future of React: Server Components and Beyond',
  excerpt:
  'Explore how React Server Components are reshaping the landscape of frontend development and what it means for your next project.',
  content: `
# The Evolution of React

React has come a long way since its inception. With the introduction of **Server Components**, we are seeing a paradigm shift in how we build web applications.

## What are Server Components?

Server Components allow developers to build applications that span the server and client, combining the rich interactivity of client-side apps with the improved performance of traditional server rendering.

> "Server Components are not a replacement for Client Components. They are a complement."

### Key Benefits:
* Zero bundle size impact
* Full access to the backend
* Automatic code splitting
* No waterfalls

Here is a quick example of a Server Component:

\`\`\`tsx
import db from './database';

export default async function PostList() {
  const posts = await db.posts.findMany();
  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
\`\`\`

The future is bright, and the ecosystem is adapting rapidly.
    `,
  coverImage: 'https://picsum.photos/seed/react/1200/600',
  authorId: 'u1',
  categories: ['Technology', 'Web Dev'],
  tags: ['React', 'TypeScript'],
  createdAt: '2023-10-15T10:00:00Z',
  readingTime: 6,
  likes: 342,
  views: 12500,
  isPublished: true,
  featured: true
},
{
  id: 'p2',
  title: 'Designing for Accessibility: A Practical Guide',
  excerpt:
  "Accessibility shouldn't be an afterthought. Learn practical tips to make your web applications usable for everyone.",
  content: 'Full content goes here...',
  coverImage: 'https://picsum.photos/seed/design/800/600',
  authorId: 'u2',
  categories: ['Design'],
  tags: ['UI/UX', 'Web Dev'],
  createdAt: '2023-10-12T14:30:00Z',
  readingTime: 8,
  likes: 215,
  views: 8400,
  isPublished: true
},
{
  id: 'p3',
  title: 'Demystifying Large Language Models',
  excerpt:
  'A beginner-friendly breakdown of how LLMs work under the hood and why they are so effective at generating text.',
  content: 'Full content goes here...',
  coverImage: 'https://picsum.photos/seed/ai/800/600',
  authorId: 'u3',
  categories: ['Technology', 'AI', 'Science'],
  tags: ['Machine Learning'],
  createdAt: '2023-10-10T09:15:00Z',
  readingTime: 12,
  likes: 512,
  views: 18200,
  isPublished: true
},
{
  id: 'p4',
  title: 'Building a Design System from Scratch',
  excerpt:
  'The step-by-step process of creating a scalable, maintainable design system for your organization.',
  content: 'Full content goes here...',
  coverImage: 'https://picsum.photos/seed/system/800/600',
  authorId: 'u2',
  categories: ['Design', 'Business'],
  tags: ['UI/UX', 'Productivity'],
  createdAt: '2023-10-05T11:20:00Z',
  readingTime: 10,
  likes: 189,
  views: 6300,
  isPublished: true
},
{
  id: 'p5',
  title: 'The Remote Work Productivity Myth',
  excerpt:
  'Are we really more productive at home? Analyzing the latest data on remote work and team output.',
  content: 'Full content goes here...',
  coverImage: 'https://picsum.photos/seed/remote/800/600',
  authorId: 'u1',
  categories: ['Business', 'Lifestyle'],
  tags: ['Productivity', 'Career'],
  createdAt: '2023-10-01T08:00:00Z',
  readingTime: 5,
  likes: 420,
  views: 15000,
  isPublished: true
}];


export const mockComments: Comment[] = [
{
  id: 'c1',
  postId: 'p1',
  authorId: 'u2',
  content:
  'Great overview! I am particularly excited about the zero bundle size impact. It is going to change how we structure our apps.',
  createdAt: '2023-10-15T11:30:00Z',
  likes: 12,
  replies: [
  {
    id: 'c1-r1',
    postId: 'p1',
    authorId: 'u1',
    content:
    'Exactly! The mental model shift is the hardest part, but the performance gains are undeniable.',
    createdAt: '2023-10-15T12:00:00Z',
    likes: 5
  }]

},
{
  id: 'c2',
  postId: 'p1',
  authorId: 'u3',
  content:
  'How does this compare to traditional SSR frameworks like Next.js pages router?',
  createdAt: '2023-10-16T09:15:00Z',
  likes: 3
}];