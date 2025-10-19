import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function SchedulingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="👥"
        title="Staff Scheduling"
        description="Create and manage staff rotas efficiently with smart scheduling tools and shift management."
        features={[
          'Drag-and-drop schedule builder',
          'Shift swap requests and approvals',
          'Labor cost forecasting',
          'Availability management',
          'Automatic overtime alerts',
          'Mobile app for staff',
        ]}
      />
    </DashboardLayout>
  );
}
