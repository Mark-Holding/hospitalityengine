import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

export default function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <DashboardHeader userEmail={userEmail} />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
}
