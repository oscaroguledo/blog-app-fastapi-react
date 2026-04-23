import React from 'react';
import { Layout } from '@/components/Layout';
import { Skeleton } from '@/components/ui/Skeleton';

export function PostListPageSkeleton() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Skeleton width={300} height={48} className="mb-2 rounded" />
          <Skeleton width={400} height={24} className="rounded" />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Skeleton width="100%" height={48} className="rounded" />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Skeleton width={120} height={36} className="rounded" />
          <Skeleton width={100} height={36} className="rounded" />
          <Skeleton width={100} height={36} className="rounded" />
          <div className="flex items-center gap-2">
            <Skeleton width={60} height={20} className="rounded" />
            <Skeleton width={140} height={36} className="rounded" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <Skeleton width={200} height={20} className="rounded" />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="bg-surface rounded-custom border border-border overflow-hidden">
              {/* Image */}
              <Skeleton width="100%" height={200} className="rounded-t-custom" />
              
              <div className="p-5">
                {/* Category */}
                <Skeleton width={80} height={20} className="mb-3 rounded" />
                
                {/* Title */}
                <Skeleton width="100%" height={24} className="mb-2 rounded" />
                <Skeleton width="90%" height={24} className="mb-3 rounded" />
                
                {/* Excerpt */}
                <Skeleton width="100%" height={16} className="mb-2 rounded" />
                <Skeleton width="85%" height={16} className="mb-4 rounded" />
                
                {/* Author and date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton 
                      width={32} 
                      height={32} 
                      variant="circle"
                      className="mr-2"
                    />
                    <Skeleton width={100} height={16} className="rounded" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton width={40} height={16} className="rounded" />
                    <Skeleton width={40} height={16} className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <Skeleton width={40} height={40} className="rounded" />
            <Skeleton width={40} height={40} className="rounded" />
            <Skeleton width={40} height={40} className="rounded" />
            <Skeleton width={40} height={40} className="rounded" />
            <Skeleton width={40} height={40} className="rounded" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
