import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default function TeamPage() {

  return (
    
      <PlaceholderPage
        icon="👨‍👩‍👧‍👦"
        title="Team Management"
        description="Manage team members, roles, and permissions for your organization."
        features={[
          'Invite team members',
          'Role-based access control',
          'Permission management',
          'Activity logs',
          'Team directory',
          'Department organization',
        ]}
      />
    
  );
}
