import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function MenuCalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="🍽️"
        title="Menu Cost Calculator"
        description="Calculate dish costs accurately, track ingredient prices, and optimize your menu profitability."
        features={[
          'Recipe costing with ingredient tracking',
          'Automatic food cost percentage calculations',
          'Pricing suggestions based on target margins',
          'Bulk import from CSV',
          'Allergen and dietary information tracking',
          'Menu engineering analysis',
        ]}
      />
    </DashboardLayout>
  );
}
