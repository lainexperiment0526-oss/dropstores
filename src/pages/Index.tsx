import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PiNetwork } from '@/components/landing/PiNetwork';
import { StoreTypes } from '@/components/landing/StoreTypes';
import { Features } from '@/components/landing/Features';
import { DroplinkIntegration } from '@/components/landing/DroplinkIntegration';
import { Templates } from '@/components/landing/Templates';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PiNetwork />
        <StoreTypes />
        <Features />
        <DroplinkIntegration />
        <Templates />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;