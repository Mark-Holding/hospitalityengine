import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="👨‍👩‍👧‍👦"
        title="Team Management"
        description="Manage team members, roles, and permissions for your organization."
        features={[
          'Invite team members',
          'Role-based access control',
          'Permission management',
          'Activity logs',
          'Team directory',
          'Department organization',
        ]}
      />
    </DashboardLayout>
  );
}
