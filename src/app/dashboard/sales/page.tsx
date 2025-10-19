import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function SalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="💰"
        title="Sales Reports"
        description="Comprehensive sales reporting and analysis to understand what's driving revenue."
        features={[
          'Daily, weekly, and monthly sales reports',
          'Sales by item, category, and server',
          'Peak hours analysis',
          'Payment method breakdowns',
          'Year-over-year comparisons',
          'Export to Excel and PDF',
        ]}
      />
    </DashboardLayout>
  );
}
