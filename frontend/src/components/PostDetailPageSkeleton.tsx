import React from 'react';
import { Layout } from '@/components/Layout';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostDetailPageSkeleton() {
  return (
    <Layout>
      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton width={60} height={20} className="rounded" />
          <Skeleton width={4} height={4} variant="circle" />
          <Skeleton width={80} height={20} className="rounded" />
          <Skeleton width={4} height={4} variant="circle" />
          <Skeleton width={120} height={20} className="rounded" />
        </div>

        {/* Header */}
        <header className="mb-12 max-w-4xl mx-auto">
          {/* Categories */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton width={80} height={28} className="rounded-custom" />
            <Skeleton width={80} height={28} className="rounded-custom" />
          </div>

          {/* Title */}
          <Skeleton width="100%" height={72} className="mb-6 rounded" />

          {/* Excerpt */}
          <Skeleton width="100%" height={32} className="mb-8 rounded" />

          {/* Author Meta */}
          <div className="flex items-center gap-4 py-4 border-y border-border">
            <Skeleton width={48} height={48} variant="circle" />
            <div className="flex-grow">
              <Skeleton width={150} height={24} className="mb-1 rounded" />
              <Skeleton width={250} height={20} className="rounded" />
            </div>
            <div className="text-right">
              <Skeleton width={120} height={20} className="rounded" />
              <Skeleton width={100} height={20} className="mt-1 rounded" />
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="mb-12 rounded-custom overflow-hidden">
          <Skeleton width="100%" height={400} className="rounded-custom" />
        </div>

        {/* Content & Sidebar */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-grow max-w-3xl">
            {/* Article Content */}
            <div className="mb-12">
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="95%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="90%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="85%" height={24} className="mb-6 rounded" />
              
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="95%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="90%" height={24} className="mb-6 rounded" />
              
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="100%" height={24} className="mb-3 rounded" />
              <Skeleton width="95%" height={24} className="rounded" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-12">
              <Skeleton width={80} height={36} className="rounded-custom" />
              <Skeleton width={80} height={36} className="rounded-custom" />
              <Skeleton width={80} height={36} className="rounded-custom" />
              <Skeleton width={80} height={36} className="rounded-custom" />
              <Skeleton width={80} height={36} className="rounded-custom" />
            </div>

            {/* Author Bio Box */}
            <div className="bg-surface border border-border rounded-custom p-8 mb-12">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Skeleton width={80} height={80} variant="circle" />
                <div className="flex-grow">
                  <Skeleton width={200} height={32} className="mb-2 rounded" />
                  <Skeleton width="100%" height={20} className="mb-4 rounded" />
                  <Skeleton width={100} height={40} className="rounded" />
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-border pt-12">
              <Skeleton width={200} height={32} className="mb-8 rounded" />

              {/* Comment Form */}
              <div className="mb-12">
                <div className="flex gap-4">
                  <Skeleton width={40} height={40} variant="circle" />
                  <div className="flex-grow">
                    <Skeleton width="100%" height={120} className="rounded" />
                    <div className="flex justify-end mt-4">
                      <Skeleton width={150} height={40} className="rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <Skeleton width={40} height={40} variant="circle" />
                    <div className="flex-grow">
                      <div className="bg-surface border border-border rounded-custom p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <Skeleton width={120} height={20} className="rounded" />
                            <Skeleton width={150} height={16} className="rounded" />
                          </div>
                          <Skeleton width={32} height={32} className="rounded" />
                        </div>
                        <Skeleton width="100%" height={20} className="rounded" />
                        <Skeleton width="90%" height={20} className="rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Sticky Actions */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Action Buttons */}
              <div className="bg-surface border border-border rounded-custom p-4">
                <div className="flex flex-col gap-3">
                  <Skeleton width="100%" height={44} className="rounded" />
                  <Skeleton width="100%" height={44} className="rounded" />
                  <Skeleton width="100%" height={44} className="rounded" />
                  <Skeleton width="100%" height={44} className="rounded" />
                </div>
              </div>

              {/* Table of Contents */}
              <div className="bg-surface border border-border rounded-custom p-4">
                <Skeleton width={150} height={20} className="mb-3 rounded" />
                <div className="space-y-2">
                  <Skeleton width={100} height={20} className="rounded" />
                  <Skeleton width={120} height={20} className="rounded" />
                  <Skeleton width={100} height={20} className="rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}
