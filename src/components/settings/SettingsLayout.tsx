'use client';

import { useState } from 'react';

interface SettingsTab {
  id: string;
  name: string;
  icon: string;
}

interface SettingsLayoutProps {
  children: (activeTab: string) => React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs: SettingsTab[] = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'organization', name: 'Organization', icon: '🏢' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'billing', name: 'Billing', icon: '💳' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {children(activeTab)}
        </div>
      </div>
    </div>
  );
}
