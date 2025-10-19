export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-gray-900 mb-6 animate-fade-in">
          Run your hospitality business
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            with confidence
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          The all-in-one platform that empowers restaurants, hotels, and bars to streamline operations,
          reduce costs, and focus on what matters most — exceptional guest experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
            Start Free Trial
          </button>
          <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium text-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-105">
            Watch Demo
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-500">No credit card required • 14-day free trial</p>
      </div>
    </section>
  );
}
