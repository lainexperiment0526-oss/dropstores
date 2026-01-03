import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PiNetwork } from '@/components/landing/PiNetwork';
import { StoreTypes } from '@/components/landing/StoreTypes';
import { Features } from '@/components/landing/Features';
import { DropPayShowcase } from '@/components/landing/DropPayShowcase';
import { DroplinkIntegration } from '@/components/landing/DroplinkIntegration';
import { Templates } from '@/components/landing/Templates';
import { Testimonials } from '@/components/landing/Testimonials';
import { PlansShowcase } from '@/components/landing/PlansShowcase';
import { PiSupplierShowcase } from '@/components/landing/PiSupplierShowcase';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <PiNetwork />
        <StoreTypes />
        <Features />
        <PiSupplierShowcase />
        <DropPayShowcase />
        <DroplinkIntegration />
        <Templates />
        <PlansShowcase />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;