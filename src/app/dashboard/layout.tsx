'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth protection is handled by middleware.ts
  // No need for client-side auth checks here

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <DashboardHeader userEmail="" />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
