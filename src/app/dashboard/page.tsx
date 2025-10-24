import { createClient } from '@/lib/supabase/server';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardHome userName={user?.email?.split('@')[0] || 'User'} />;
}
