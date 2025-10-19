import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function HRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="👔"
        title="HR Tools"
        description="Manage your team with comprehensive HR tools for hospitality businesses."
        features={[
          'Employee records and profiles',
          'Holiday and absence tracking',
          'Performance reviews',
          'Document management',
          'Payroll preparation',
          'Onboarding workflows',
        ]}
      />
    </DashboardLayout>
  );
}
