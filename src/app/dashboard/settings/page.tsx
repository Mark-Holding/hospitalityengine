'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import OrganizationSettings from '@/components/settings/OrganizationSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import BillingSettings from '@/components/settings/BillingSettings';

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email || '');
      }
    };
    getUser();
  }, [router, supabase]);

  if (!userEmail) return null;

  return (
    <SettingsLayout>
      {(activeTab) => {
        switch (activeTab) {
          case 'profile':
            return <ProfileSettings userEmail={userEmail} />;
          case 'security':
            return <SecuritySettings />;
          case 'organization':
            return <OrganizationSettings />;
          case 'preferences':
            return <PreferencesSettings />;
          case 'billing':
            return <BillingSettings />;
          default:
            return <ProfileSettings userEmail={userEmail} />;
        }
      }}
    </SettingsLayout>
  );
}
