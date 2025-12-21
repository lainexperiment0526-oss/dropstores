import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { StoreTypes } from '@/components/landing/StoreTypes';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <StoreTypes />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;