import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
            <div className="mb-8 p-4 border-l-4 border-primary bg-primary/5 rounded-md">
              <p className="mb-3 font-medium">Legal Agreement Between You and Drop Store</p>
              <p className="text-muted-foreground mb-4">
                By accessing or using Drop Store, you agree to be bound by these Terms of Service and all applicable laws. Please read carefully before using our platform.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">Last updated: December 2024</p>

              <div className="my-8 p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium">Summary:</p>
                <p>
                  These terms govern your use of Drop Store. You are responsible for your account, maintaining accurate merchant information, fulfilling orders timely, and complying with payment terms.
                  Drop Store may terminate accounts that violate these terms. All transactions use Pi Network cryptocurrency.
                </p>
              </div>
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Drop Store, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Account Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your Pi Network account and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Merchant Obligations</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Provide Accurate Information</h3>
                  <p className="text-sm">Product descriptions, pricing, and merchant details must be accurate.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Fulfill Orders Timely</h3>
                  <p className="text-sm">Ship or deliver products within stated timeframes.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Customer Service</h3>
                  <p className="text-sm">Respond to inquiries within 48 hours and handle complaints professionally.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Maintain Inventory</h3>
                  <p className="text-sm">Keep accurate stock counts and avoid overselling.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Refund Policy</h3>
                  <p className="text-sm">Process refunds according to your stated policy.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Legal Compliance</h3>
                  <p className="text-sm\">Comply with all applicable local laws and regulations.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Payment Terms</h2>
              <p>
                All transactions are processed through Pi Network. Merchants receive payments directly to their configured Pi wallet. Drop Store charges subscription fees as per the selected plan. All fees are non-refundable unless otherwise specified.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Subscription & Billing</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Monthly Billing</h3>
                  <p className="text-sm">Subscriptions are billed monthly in Pi cryptocurrency.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Billing Dates</h3>
                  <p className="text-sm">Billing occurs on the same date each month as your subscription start.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Cancellation</h3>
                  <p className="text-sm">Cancel anytime; no refunds for current billing period.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Plan Changes</h3>
                  <p className="text-sm">Upgrades or downgrades take effect immediately or next billing cycle.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property Rights</h2>
              <p>
                The Drop Store platform, including its software, design, and branding, is the intellectual property of Mrwain Organization. You may not copy, modify, or distribute any portion of the platform without explicit permission.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. User Content</h2>
              <p>
                You retain ownership of content you create and post. By posting content on Drop Store, you grant us the right to host, display, and use it for the purpose of operating the service. You are responsible for ensuring your content does not infringe on third-party rights.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Drop Store and its owners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Disclaimers</h2>
              <p>
                The service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or free from viruses or other harmful components.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Termination</h2>
              <p>
                Drop Store may suspend or terminate your account at any time if you violate these terms, engage in prohibited activities, or for any other reason at our sole discretion. Upon termination, your right to use the platform ceases immediately.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
              <p>
                We may update these Terms of Service at any time. The date at the top indicates when they were last updated. Continued use of the platform after changes constitutes your acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">12. Contact</h2>
              <p>
                For questions about these terms, please contact <a href="mailto:support@dropshops.space" className="text-primary hover:underline">support@dropshops.space</a>.
              </p>

              <div className="mt-12 p-4 border border-muted rounded-lg">
                <p className="font-medium mb-2">Related Legal Documents:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                  <li><Link to="/business" className="text-primary hover:underline">Business Guidelines</Link></li>
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

export default Terms;
