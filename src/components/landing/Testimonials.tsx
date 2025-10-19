export default function Testimonials() {
  const testimonials = [
    {
      quote: "Hospitality Engine saved us 15 hours a week on admin. Now I can focus on what I love — creating amazing food experiences.",
      author: "Sarah Chen",
      role: "Head Chef & Owner",
      business: "The Modern Table"
    },
    {
      quote: "Our food costs dropped 8% in the first month. The menu calculator alone paid for the entire platform.",
      author: "James Mitchell",
      role: "Restaurant Manager",
      business: "Harbor Grill"
    },
    {
      quote: "Staff scheduling used to take me half a day. Now it's done in 20 minutes. Game changer.",
      author: "Emma Rodriguez",
      role: "Operations Director",
      business: "Skyline Hotels"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
            Trusted by hospitality leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of restaurants, hotels, and bars transforming their operations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-6 text-blue-600">"</div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="border-t border-gray-100 pt-6">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-gray-500">{testimonial.business}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
