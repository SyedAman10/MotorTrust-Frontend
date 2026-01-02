import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import TargetUsers from './components/TargetUsers';
import AISystem from './components/AISystem';
import MobileApp from './components/MobileApp';
import CTA from './components/CTA';
import Footer from './components/Footer';
import BackgroundElements from './components/BackgroundElements';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <BackgroundElements />
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <TargetUsers />
      <AISystem />
      <MobileApp />
      <CTA />
      <Footer />
    </div>
  );
}
