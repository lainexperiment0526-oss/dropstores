import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Drop Store and how does it work?',
    answer: 'Drop Store is the #1 e-commerce platform built specifically for Pi Network. Create your online store, list products, and accept Pi cryptocurrency payments instantly. No technical knowledge required - get started in minutes with our easy-to-use platform.',
  },
  {
    question: 'Do I need to pay to create a store?',
    answer: 'No! Creating your store is completely free. There are no setup fees, no monthly charges, and no hidden costs. We only charge a small transaction fee when you make a sale, so you only pay when you earn.',
  },
  {
    question: 'How do Pi Network payments work?',
    answer: 'Drop Store is fully integrated with Pi Network Mainnet. Your customers pay with their Pi wallet through the Pi Browser, and you receive payments instantly to your Pi wallet. All transactions are secure, verified, and processed on the Pi Mainnet blockchain.',
  },
  {
    question: 'Can I sell both physical and digital products?',
    answer: 'Yes! Drop Store supports all types of products including physical goods, digital downloads, services, and subscriptions. You can manage inventory, set up variants, offer discount codes, and handle shipping for physical products.',
  },
  {
    question: 'Is my store accessible to all Pi Network users?',
    answer: 'Absolutely! Your store is accessible to all 50M+ Pi Network users worldwide through the Pi Browser. Customers can find and shop at your store 24/7 from anywhere in the world.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'Drop Store primarily accepts Pi cryptocurrency payments through Pi Network Mainnet. This gives you access to millions of Pi users and lower transaction fees (0.1% vs 3-5% traditional processors). Traditional payment methods coming soon.',
  },
  {
    question: 'How quickly can I set up my store?',
    answer: 'You can have your store live in under 10 minutes! Simply sign up with Pi Network authentication, customize your store design, add your products, and publish. Our intuitive dashboard makes store management incredibly easy.',
  },
  {
    question: 'Do you provide customer support?',
    answer: 'Yes! We offer 24/7 customer support specialized in Pi Network transactions and e-commerce. Our team is here to help with technical issues, payment questions, and store optimization.',
  },
  {
    question: 'Can I customize my store design?',
    answer: 'Yes! Choose from multiple professionally designed templates, customize colors and branding, upload your logo and banner, and create a unique storefront that represents your brand perfectly.',
  },
  {
    question: 'What are the transaction fees?',
    answer: 'We charge only 0.1% per transaction - up to 90% lower than traditional payment processors (3-5%). No monthly fees, no setup costs. You keep more of what you earn.',
  },
  {
    question: 'Is my data and customer information secure?',
    answer: 'Absolutely! We use enterprise-grade security with encryption, secure authentication through Pi Network KYC, and follow all data protection regulations. Your business and customer data is safe with us.',
  },
  {
    question: 'Can I track my sales and analytics?',
    answer: 'Yes! Our comprehensive dashboard provides real-time analytics including sales reports, order tracking, customer insights, revenue charts, and performance metrics to help grow your business.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-background via-secondary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Drop Store and selling on Pi Network
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-8">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-primary" />
                    ) : (
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="mailto:support@dropstore.com"
              className="text-primary hover:underline font-medium"
            >
              Contact our support team →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
