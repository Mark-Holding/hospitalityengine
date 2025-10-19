export default function Problem() {
  const problems = [
    {
      icon: "📊",
      title: "Drowning in spreadsheets",
      description: "Hours wasted on manual calculations, menu costing, and inventory tracking across disconnected tools."
    },
    {
      icon: "⏰",
      title: "Scheduling chaos",
      description: "Staff rotas that take hours to build, constant shift swaps, and last-minute coverage scrambles."
    },
    {
      icon: "💸",
      title: "Profit leaks everywhere",
      description: "Rising costs, unclear margins, and no clear visibility into what's actually making money."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
            Sound familiar?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Running a hospitality business shouldn't feel like fighting fires every day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-3xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="text-6xl mb-6">{problem.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {problem.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
