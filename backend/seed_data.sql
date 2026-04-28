-- Database Seeding Script for Blog Application
-- This script inserts sample data for development/testing purposes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
-- Passwords are bcrypt hashed. 
-- All passwords are: "password123"

INSERT INTO users (id, "firstName", "lastName", email, password, role, bio, active, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'John', 'Doe', 'john.doe@example.com', '$2b$12$VAzzWK7oEppTnAozcEwTJOtV7TfQYwRRoEvael52sVAvOA6OS6a.a', 'Admin', 'Full-stack developer and tech enthusiast.', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Jane', 'Smith', 'jane.smith@example.com', '$2b$12$VAzzWK7oEppTnAozcEwTJOtV7TfQYwRRoEvael52sVAvOA6OS6a.a', 'Writer', 'Tech writer and blogger.', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Bob', 'Johnson', 'bob.johnson@example.com', '$2b$12$VAzzWK7oEppTnAozcEwTJOtV7TfQYwRRoEvael52sVAvOA6OS6a.a', 'Editor', 'Content editor and reviewer.', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Alice', 'Williams', 'alice.williams@example.com', '$2b$12$VAzzWK7oEppTnAozcEwTJOtV7TfQYwRRoEvael52sVAvOA6OS6a.a', 'Reader', 'Avid reader and subscriber.', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Charlie', 'Brown', 'charlie.brown@example.com', '$2b$12$VAzzWK7oEppTnAozcEwTJOtV7TfQYwRRoEvael52sVAvOA6OS6a.a', 'Writer', 'Freelance writer and journalist.', true, NOW(), NOW());

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (id, name, slug, description, created_at, updated_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', 'Technology', 'technology', 'Articles about technology, software, and gadgets', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', 'Lifestyle', 'lifestyle', 'Lifestyle tips, health, and wellness', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', 'Business', 'business', 'Business news, startups, and entrepreneurship', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', 'Travel', 'travel', 'Travel guides and adventure stories', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440005', 'Food', 'food', 'Recipes, restaurant reviews, and food culture', NOW(), NOW());

-- ============================================
-- TAGS
-- ============================================

INSERT INTO tags (id, name, slug, created_at, updated_at)
VALUES
    ('770e8400-e29b-41d4-a716-446655440001', 'Python', 'python', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440002', 'JavaScript', 'javascript', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440003', 'AI', 'artificial-intelligence', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440004', 'Tutorial', 'tutorial', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440005', 'News', 'news', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440006', 'Tips', 'tips', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440007', 'Review', 'review', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440008', 'Startup', 'startup', NOW(), NOW());

-- ============================================
-- POSTS
-- ============================================

INSERT INTO posts (id, title, excerpt, content, "coverImage", "authorId", "readingTime", likes, views, "isPublished", featured, created_at, updated_at)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', 
     'Getting Started with FastAPI', 
     'A comprehensive guide to building APIs with FastAPI',
     'FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints. In this article, we will explore the basics of FastAPI and how to build a simple REST API.',
     'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
     '550e8400-e29b-41d4-a716-446655440002',
     8, 42, 156, true, true, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440002', 
     'The Future of Artificial Intelligence', 
     'Exploring the latest trends in AI and machine learning',
     'Artificial Intelligence is transforming industries across the globe. From healthcare to finance, AI is making significant impacts. This article discusses the current state of AI and what we can expect in the coming years.',
     'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
     '550e8400-e29b-41d4-a716-446655440002',
     10, 89, 342, true, true, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440003', 
     '10 Productivity Tips for Remote Workers', 
     'How to stay productive while working from home',
     'Working from home has become the new normal for many professionals. Here are 10 tips to help you maintain productivity and work-life balance in a remote environment.',
     'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
     '550e8400-e29b-41d4-a716-446655440005',
     6, 35, 128, true, false, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440004', 
     'Building Scalable Applications with Docker', 
     'A deep dive into containerization and Docker',
     'Docker has revolutionized how we develop and deploy applications. Learn how to use Docker to build scalable, portable applications that run consistently across different environments.',
     'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
     '550e8400-e29b-41d4-a716-446655440002',
     12, 67, 289, true, false, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440005', 
     'The Ultimate Guide to React Hooks', 
     'Mastering React Hooks for modern development',
     'React Hooks have changed the way we write React components. This comprehensive guide covers all the built-in hooks and best practices for creating custom hooks.',
     'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
     '550e8400-e29b-41d4-a716-446655440005',
     15, 124, 567, true, true, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440006', 
     'Startup Lessons: From Idea to IPO', 
     'Key lessons from successful startup founders',
     'Building a startup is a challenging journey. Learn from the experiences of successful founders who have taken their companies from idea to IPO.',
     'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
     '550e8400-e29b-41d4-a716-446655440005',
     9, 56, 234, true, false, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440007', 
     'Healthy Eating on a Budget', 
     'Nutritious meals without breaking the bank',
     'Eating healthy doesn''t have to be expensive. Discover practical tips and recipes for maintaining a nutritious diet while staying within your budget.',
     'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
     '550e8400-e29b-41d4-a716-446655440002',
     7, 43, 198, true, false, NOW(), NOW()),

    ('880e8400-e29b-41d4-a716-446655440008', 
     'Top 10 Travel Destinations for 2024', 
     'Your guide to the best places to visit this year',
     'Planning your next adventure? Here are the top 10 travel destinations that should be on your radar for 2024, from exotic beaches to historic cities.',
     'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
     '550e8400-e29b-41d4-a716-446655440005',
     8, 78, 345, true, false, NOW(), NOW());

-- ============================================
-- POST-CATEGORY RELATIONSHIPS
-- ============================================

INSERT INTO post_category (post_id, category_id)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'), -- FastAPI -> Technology
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001'), -- AI -> Technology
    ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002'), -- Productivity -> Lifestyle
    ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001'), -- Docker -> Technology
    ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001'), -- React -> Technology
    ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003'), -- Startup -> Business
    ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002'), -- Healthy Eating -> Lifestyle
    ('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004'); -- Travel -> Travel

-- ============================================
-- POST-TAG RELATIONSHIPS
-- ============================================

INSERT INTO post_tag (post_id, tag_id)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001'), -- FastAPI -> Python
    ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004'), -- FastAPI -> Tutorial
    ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003'), -- AI -> AI
    ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005'), -- AI -> News
    ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006'), -- Productivity -> Tips
    ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002'), -- Productivity -> Lifestyle
    ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004'), -- Docker -> Tutorial
    ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002'), -- React -> JavaScript
    ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004'), -- React -> Tutorial
    ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440008'), -- Startup -> Startup
    ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006'), -- Startup -> Tips
    ('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440006'), -- Healthy Eating -> Tips
    ('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440007'), -- Travel -> Review
    ('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440006'); -- Travel -> Tips
