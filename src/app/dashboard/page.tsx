import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout userEmail={user.email || 'user@example.com'}>
      <DashboardHome userName={user.email?.split('@')[0] || 'User'} />
    </DashboardLayout>
  );
}
