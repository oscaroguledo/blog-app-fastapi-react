import React from 'react';
import { Layout } from '@/components/Layout';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users, Heart, Target } from 'lucide-react';
import { APP_NAME } from '@/config';

export function AboutPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-6">
            About {APP_NAME}
          </h1>
          <p className="text-xl text-muted-text max-w-3xl mx-auto leading-relaxed">
            A modern platform for sharing ideas, stories, and knowledge. We believe in the power of words to connect, inspire, and transform.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center">
            <Target className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-text mb-4">Our Mission</h2>
            <p className="text-muted-text max-w-2xl mx-auto leading-relaxed">
              To democratize knowledge sharing by providing a platform where anyone can share their ideas, stories, and expertise with the world. We strive to create an inclusive community that values diverse perspectives and fosters meaningful conversations.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-serif font-bold text-text mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface border border-border rounded-custom p-6 text-center">
              <Heart className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">Passion</h3>
              <p className="text-sm text-muted-text">
                We're passionate about creating meaningful content that resonates with readers and writers alike.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-custom p-6 text-center">
              <Users className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">Community</h3>
              <p className="text-sm text-muted-text">
                Building a supportive community where ideas flourish and connections are made.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-custom p-6 text-center">
              <BookOpen className="h-10 w-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">Knowledge</h3>
              <p className="text-sm text-muted-text">
                Empowering people to share and discover knowledge that can change lives.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface border border-border rounded-2xl p-8 md:p-12"
        >
          <h2 className="text-3xl font-serif font-bold text-text mb-6">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-text leading-relaxed">
            <p className="mb-4">
              {APP_NAME} was born from a simple idea: everyone has a story worth telling. In a world of endless content, we wanted to create a space where quality writing could shine and thoughtful discussions could thrive.
            </p>
            <p className="mb-4">
              Started in 2024, we began as a small team of writers and developers who believed in the transformative power of words. Today, we've grown into a vibrant community of storytellers, thinkers, and creators from around the globe.
            </p>
            <p>
              Our platform is designed to be simple yet powerful, giving writers the tools they need to share their work while making it easy for readers to discover content that matters to them. We're constantly evolving, always listening to our community, and committed to building the best platform for ideas and stories.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
