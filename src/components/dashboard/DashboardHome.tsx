'use client';

export default function DashboardHome({ userName }: { userName: string }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const recentTools = [
    { name: 'Menu Cost Calculator', icon: '🍽️', href: '/dashboard/menu-calculator', lastUsed: '2 hours ago' },
    { name: 'Staff Scheduling', icon: '👥', href: '/dashboard/scheduling', lastUsed: 'Yesterday' },
    { name: 'Sales Reports', icon: '💰', href: '/dashboard/sales', lastUsed: '3 days ago' },
  ];

  const todos = [
    { task: 'Review weekly food costs', priority: 'high', completed: false },
    { task: 'Approve next week\'s staff schedule', priority: 'medium', completed: false },
    { task: 'Update menu prices for seasonal items', priority: 'medium', completed: true },
    { task: 'Complete health & safety checklist', priority: 'high', completed: false },
  ];

  const updates = [
    {
      title: 'New Feature: Bulk Menu Import',
      description: 'You can now import your entire menu from a CSV file in the Menu Cost Calculator.',
      date: '2 days ago',
      type: 'feature',
    },
    {
      title: 'Company News: Holiday Hours',
      description: 'Support team will have limited availability Dec 24-26. Plan ahead for any urgent needs.',
      date: '1 week ago',
      type: 'news',
    },
    {
      title: 'Update: Enhanced Analytics',
      description: 'New profit margin trends and cost variance reports are now available in Analytics.',
      date: '2 weeks ago',
      type: 'update',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-blue-100">{currentDate}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Food Cost %</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">28.5%</p>
          <p className="text-xs text-green-600 mt-1">↓ 2.3% from last month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Labor Cost %</span>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">32.1%</p>
          <p className="text-xs text-green-600 mt-1">↓ 1.5% from last month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Revenue</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">$45.2K</p>
          <p className="text-xs text-green-600 mt-1">↑ 8.2% from last week</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Staff Scheduled</span>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">24</p>
          <p className="text-xs text-gray-500 mt-1">for this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Used Tools */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Used Tools</h2>
            <div className="space-y-3">
              {recentTools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.href}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{tool.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{tool.name}</p>
                      <p className="text-sm text-gray-500">Last used {tool.lastUsed}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Updates & News */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Updates & News</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                See all
              </button>
            </div>
            <div className="space-y-4">
              {updates.map((update, index) => (
                <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {update.type === 'feature' ? '✨' : update.type === 'news' ? '📰' : '🔄'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{update.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                      <p className="text-xs text-gray-400">{update.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's To-Do List */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's To-Do List</h2>
          <div className="space-y-3">
            {todos.map((todo, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  todo.completed ? 'bg-gray-50' : 'bg-white border border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  readOnly
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {todo.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        todo.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {todo.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            + Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
