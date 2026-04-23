import React from 'react';
import { Layout } from '@/components/Layout';
import { Skeleton } from '@/components/ui/Skeleton';

export function HomePageSkeleton() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section Skeleton */}
        <section className="mb-12 md:mb-16">
          <div className="relative rounded-custom overflow-hidden">
            <Skeleton 
              className="w-full h-full"
              height={400}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="max-w-3xl">
                {/* Category badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton width={80} height={24} className="rounded-custom" />
                  <Skeleton width={80} height={24} className="rounded-custom" />
                </div>

                {/* Title */}
                <Skeleton 
                  width="100%" 
                  height={48} 
                  className="mb-4 rounded"
                />

                {/* Excerpt */}
                <Skeleton 
                  width="90%" 
                  height={24} 
                  className="mb-2 rounded"
                />
                <Skeleton 
                  width="80%" 
                  height={24} 
                  className="mb-6 rounded"
                />

                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton 
                      width={40} 
                      height={40} 
                      variant="circle"
                      className="mr-3"
                    />
                    <div>
                      <Skeleton width={120} height={20} className="mb-1 rounded" />
                      <div className="flex space-x-1">
                        <Skeleton width={80} height={16} className="rounded" />
                        <Skeleton width={4} height={16} className="rounded" />
                        <Skeleton width={60} height={16} className="rounded" />
                      </div>
                    </div>
                  </div>

                  <Skeleton width={120} height={24} className="hidden md:block rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Post Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <Skeleton width={200} height={32} className="rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Post Card Skeletons */}
              {[...Array(6)].map((_, index) => (
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
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-custom border border-border p-6">
              {/* Categories section */}
              <Skeleton width={120} height={24} className="mb-4 rounded" />
              <div className="space-y-2 mb-8">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton width={100} height={20} className="rounded" />
                    <Skeleton width={30} height={20} className="rounded" />
                  </div>
                ))}
              </div>

              {/* Tags section */}
              <Skeleton width={80} height={24} className="mb-4 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, index) => (
                  <Skeleton key={index} width={60} height={24} className="rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
