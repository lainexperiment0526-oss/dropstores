import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

const Business = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Business Guidelines</h1>
            <div className="mb-8 p-4 border-l-4 border-primary bg-primary/5 rounded-md">
              <p className="mb-3 font-medium">Building Trust in the Pi Economy</p>
              <p className="text-muted-foreground mb-4">
                Standards for merchants and service providers on Drop Store. Our Business Guidelines ensure legitimate operations, fair practices, and a trustworthy marketplace for all users.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">Last updated: December 2024</p>

              <div className="my-8 p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium">Summary:</p>
                <p>
                  All businesses on Drop Store must maintain legitimate operations with accurate product information, fair pricing, responsive customer service,
                  and compliance with Pi Network integration standards. We enforce these guidelines to protect merchants and customers alike.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Legitimate Business Requirements</h2>
              <p>
                All businesses operating on Drop Store must maintain legitimate operations that comply with local laws and regulations. We require accurate business information and transparent practices.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Product and Service Standards</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Accurate Descriptions</h3>
                  <p className="text-sm">Product titles, descriptions, and images must accurately represent what is being sold.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
                  <p className="text-sm">Prices must be clearly displayed and any additional fees disclosed upfront.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Quality Assurance</h3>
                  <p className="text-sm">Goods and services must meet the standards described and be delivered in good condition.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Inventory Management</h3>
                  <p className="text-sm">Maintain accurate stock counts to avoid overselling or misleading availability.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Customer Service Standards</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to customer inquiries within 48 hours</li>
                <li>Provide clear information about shipping, delivery times, and return policies</li>
                <li>Handle complaints and disputes in a professional and timely manner</li>
                <li>Maintain fair refund and return policies</li>
                <li>Preserve customer data with appropriate security measures</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Pi Network Integration Standards</h2>
              <p>When accepting Pi Network payments, merchants must:</p>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Irreversible Transactions</h3>
                  <p className="text-sm">Clearly disclose that Pi Network transactions are irreversible.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Compliance</h3>
                  <p className="text-sm">Maintain compliance with Pi Network's terms and policies.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Integrity</h3>
                  <p className="text-sm">Do not engage in practices that undermine the integrity of Pi Network.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Wallet Configuration</h3>
                  <p className="text-sm">Ensure proper wallet configuration and payment processing.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Business Conduct</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Honesty</h3>
                  <p className="text-sm">All marketing and sales materials must be truthful and not misleading.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">No Deception</h3>
                  <p className="text-sm">Do not use fake reviews, testimonials, or misleading promotional tactics.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Intellectual Property</h3>
                  <p className="text-sm">Do not use trademarked materials or copyrighted content without permission.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Fair Competition</h3>
                  <p className="text-sm">Compete fairly and do not engage in sabotage or harassment of other merchants.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Financial Transparency</h2>
              <p>Merchants should maintain transparent financial records and clearly communicate:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees and billing dates</li>
                <li>Any additional charges or platform fees</li>
                <li>Refund and chargeback policies</li>
                <li>Tax implications and responsibilities</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Data Protection and Privacy</h2>
              <p>Protect customer data responsibly:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Collect only necessary customer information</li>
                <li>Secure customer data against unauthorized access</li>
                <li>Honor customer privacy preferences</li>
                <li>Comply with applicable data protection regulations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Compliance and Enforcement</h2>
              <p>Drop Store reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monitor business activities for compliance with these guidelines</li>
                <li>Request documentation to verify business legitimacy</li>
                <li>Suspend or terminate accounts that violate these standards</li>
                <li>Report serious violations to relevant authorities</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Contact</h2>
              <p>
                For questions about business guidelines, please contact <a href="mailto:support@dropshops.space" className="text-primary hover:underline">support@dropshops.space</a>.
              </p>

              <div className="mt-12 p-4 border border-muted rounded-lg">
                <p className="font-medium mb-2">Related Legal Documents:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><Link to="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                  <li><Link to="/prohibited" className="text-primary hover:underline">Prohibited Activities</Link></li>
                  <li><Link to="/gdpr" className="text-primary hover:underline">GDPR Compliance</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default Business;
