export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-semibold text-white mb-6">
          Ready to transform your operations?
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
          Join the hospitality businesses that are saving time, cutting costs, and growing with confidence.
          Start your free trial today — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-10 py-5 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-xl">
            Start Free Trial
          </button>
          <button className="px-10 py-5 bg-transparent text-white rounded-full font-semibold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all hover:scale-105">
            Schedule a Demo
          </button>
        </div>
        <p className="mt-8 text-blue-100">14-day free trial • No credit card required • Setup in 5 minutes</p>
      </div>
    </section>
  );
}
