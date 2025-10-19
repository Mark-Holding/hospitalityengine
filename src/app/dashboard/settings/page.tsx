import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="⚙️"
        title="Account Settings"
        description="Manage your account preferences, profile, and application settings."
        features={[
          'Profile information',
          'Password and security',
          'Notification preferences',
          'Billing and subscription',
          'Integration settings',
          'Data export',
        ]}
      />
    </DashboardLayout>
  );
}
