import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <PlaceholderPage
        icon="📦"
        title="Inventory Management"
        description="Track stock levels, manage suppliers, and reduce waste with intelligent inventory controls."
        features={[
          'Real-time stock level tracking',
          'Automated reorder alerts',
          'Supplier management',
          'Waste tracking and analysis',
          'Stock take tools',
          'Integration with menu costing',
        ]}
      />
    </DashboardLayout>
  );
}
