export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Perfect for small independent venues",
      features: [
        "Menu cost calculator",
        "Basic scheduling",
        "Sales reporting",
        "Up to 15 staff members",
        "Email support"
      ]
    },
    {
      name: "Professional",
      price: "99",
      description: "For growing hospitality businesses",
      features: [
        "Everything in Starter",
        "Advanced analytics",
        "Inventory management",
        "Compliance tools",
        "Up to 50 staff members",
        "Priority support"
      ],
      featured: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For multi-site operations",
      features: [
        "Everything in Professional",
        "Unlimited staff",
        "Multi-location support",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support"
      ]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.featured
                  ? 'border-blue-600 shadow-2xl bg-gradient-to-b from-blue-50 to-white scale-105'
                  : 'border-gray-200 hover:border-blue-200 hover:shadow-xl bg-white'
              }`}
            >
              {plan.featured && (
                <div className="text-center mb-4">
                  <span className="inline-block px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-gray-600 ml-2">/month</span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 rounded-full font-semibold transition-all hover:scale-105 ${
                  plan.featured
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center mt-12 text-gray-600">
          All plans are billed monthly. Cancel anytime, no questions asked.
        </p>
      </div>
    </section>
  );
}
