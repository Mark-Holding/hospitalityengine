import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="📄"
        title="Documents"
        description="Centralized document storage and management for all your business files."
        features={[
          'Secure cloud storage',
          'Folder organization',
          'Version control',
          'Share with team members',
          'Search and filters',
          'Document templates',
        ]}
      />
    </DashboardLayout>
  );
}
