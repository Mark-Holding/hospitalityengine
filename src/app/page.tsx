import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <div id="features">
          <Features />
        </div>
        <div id="testimonials">
          <Testimonials />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
