export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <nav className="py-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-3 mb-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Header Skeleton */}
      <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-30">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Title Skeleton */}
          <div className="mb-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Content Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
