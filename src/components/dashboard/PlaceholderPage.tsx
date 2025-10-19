interface PlaceholderPageProps {
  icon: string;
  title: string;
  description: string;
  features?: string[];
}

export default function PlaceholderPage({ icon, title, description, features }: PlaceholderPageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-200">
        <div className="text-8xl mb-6">{icon}</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>

        {features && features.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planned Features</h2>
            <ul className="space-y-3 text-left max-w-md mx-auto">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 inline-block px-6 py-3 bg-blue-50 text-blue-600 rounded-xl">
          <p className="text-sm font-medium">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
