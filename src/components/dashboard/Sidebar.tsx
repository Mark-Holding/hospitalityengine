'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'Menu Cost Calculator', href: '/dashboard/menu-calculator', icon: '🍽️' },
        { name: 'Staff Scheduling', href: '/dashboard/scheduling', icon: '👥' },
        { name: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
        { name: 'Sales Reports', href: '/dashboard/sales', icon: '💰' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Compliance', href: '/dashboard/compliance', icon: '✅' },
        { name: 'HR Tools', href: '/dashboard/hr', icon: '👔' },
        { name: 'Documents', href: '/dashboard/documents', icon: '📄' },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { name: 'Account', href: '/dashboard/settings', icon: '⚙️' },
        { name: 'Team', href: '/dashboard/team', icon: '👨‍👩‍👧‍👦' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HospitalityEngine
          </Link>
        )}
        {isCollapsed && (
          <div className="text-2xl mx-auto">🏨</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 min-h-0">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm"
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
}
