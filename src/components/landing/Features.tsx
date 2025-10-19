export default function Features() {
  const features = [
    {
      icon: "🍽️",
      title: "Menu Cost Calculator",
      description: "Calculate dish costs instantly, track ingredient prices, and optimize your menu profitability in real-time."
    },
    {
      icon: "👥",
      title: "Smart Scheduling",
      description: "Build rotas in minutes, manage shift swaps, and forecast labor costs with intelligent automation."
    },
    {
      icon: "📈",
      title: "Sales Analytics",
      description: "Understand what's selling, track trends, and make data-driven decisions with beautiful dashboards."
    },
    {
      icon: "✅",
      title: "Compliance Tools",
      description: "Stay on top of health & safety, allergen tracking, and regulatory requirements effortlessly."
    },
    {
      icon: "📦",
      title: "Inventory Management",
      description: "Track stock levels, automate ordering, and reduce waste with intelligent inventory controls."
    },
    {
      icon: "💰",
      title: "Financial Insights",
      description: "See your P&L in real-time, understand your margins, and identify opportunities to increase profits."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
            Everything you need to thrive
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools that work together seamlessly to run your entire operation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
