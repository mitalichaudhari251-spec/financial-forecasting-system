"use client";
import DashboardSkeleton from '@/components/loaders/DashboardSkeleton';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <DashboardSkeleton />
    </DashboardLayout>
  );
}
