import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="✅"
        title="Compliance Tools"
        description="Stay on top of health & safety, food hygiene, and regulatory requirements effortlessly."
        features={[
          'Health & safety checklists',
          'Allergen information management',
          'Temperature logging',
          'HACCP compliance tracking',
          'Staff training records',
          'Audit trail and reporting',
        ]}
      />
    </DashboardLayout>
  );
}
