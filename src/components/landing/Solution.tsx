export default function Solution() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
            One platform.
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Complete control.
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hospitality Engine brings all your operational tools together in one beautiful,
            intuitive platform designed specifically for the hospitality industry.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-12">
          <div className="aspect-video bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🖥️</div>
              <p className="text-gray-500 text-lg">Product Dashboard Preview</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Built for hospitality</h3>
            <p className="text-lg text-gray-600">
              Every feature is designed with restaurant, hotel, and bar operators in mind.
              No bloat, no complexity — just the tools you actually need.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Works everywhere</h3>
            <p className="text-lg text-gray-600">
              Access your business from any device. Make decisions on the floor,
              at home, or on the go with our responsive platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
