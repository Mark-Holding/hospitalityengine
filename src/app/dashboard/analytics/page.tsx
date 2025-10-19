import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="📈"
        title="Analytics"
        description="Get powerful insights into your business performance with real-time analytics and reporting."
        features={[
          'Revenue and profit trends',
          'Cost analysis and variance reports',
          'Sales performance by item and category',
          'Labor cost optimization insights',
          'Custom date range comparisons',
        ]}
      />
    </DashboardLayout>
  );
}
