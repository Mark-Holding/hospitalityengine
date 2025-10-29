import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/server';
import { BusinessProvider } from '@/contexts/BusinessContext';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <DashboardHeader userEmail={user?.email || ''} userId={user?.id || ''} />
        <main className="ml-64 mt-16 p-6">
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}
