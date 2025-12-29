import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
            <div className="mb-8 p-4 border-l-4 border-primary bg-primary/5 rounded-md">
              <p className="mb-3 font-medium">How We Protect Your Data</p>
              <p className="text-muted-foreground mb-4">
                This Privacy Policy explains how Drop Store collects, uses, and protects your personal information. We are committed to maintaining your privacy and complying with applicable data protection laws.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">Last updated: December 29, 2025</p>

              <div className="my-8 p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium">Summary:</p>
                <p>
                  Drop Store collects only necessary information, processes it lawfully, and respects your rights to access, correct, and delete your data.
                  We implement appropriate security measures and do not sell your personal information to third parties.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Account Information</h3>
                  <p className="text-sm">Name, email address, username, and profile details.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Usage Data</h3>
                  <p className="text-sm">Pages viewed, clicks, interactions, and engagement metrics.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Technical Data</h3>
                  <p className="text-sm">Device, browser, IP address, and cookies.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Transaction Data</h3>
                  <p className="text-sm">Payment and Pi cryptocurrency transaction information.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Platform Operation</h3>
                  <p className="text-sm">To operate and improve our services.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Customer Support</h3>
                  <p className="text-sm">To provide support and respond to inquiries.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Fraud Prevention</h3>
                  <p className="text-sm">To process payments and prevent fraud.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Legal Compliance</h3>
                  <p className="text-sm">To comply with legal obligations.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to provide core functionality, remember preferences, and analyze usage. You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share data with trusted service providers who help us operate our services (e.g., hosting, analytics, payments) under appropriate safeguards.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
              <p>
                We implement technical and organizational measures to protect your data, including encryption in transit, access controls, and regular security reviews.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Access Your Data</h3>
                  <p className="text-sm">Request a copy of your personal information.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Correct Your Data</h3>
                  <p className="text-sm">Request correction of inaccurate information.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Delete Your Data</h3>
                  <p className="text-sm">Request deletion of your personal data.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Export Your Data</h3>
                  <p className="text-sm">Receive your data in a portable format.</p>
                </div>
              </div>
              <p className="mt-4">
                EU/UK users can visit our <Link to="/gdpr" className="text-primary hover:underline">GDPR Compliance</Link> page for data subject requests.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">International Transfers</h2>
              <p>
                If we transfer data outside your country, we use appropriate safeguards, such as Standard Contractual Clauses, where applicable.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Updates to This Policy</h2>
              <p>
                We may update this policy from time to time. We will indicate the latest update date above and notify you of material changes as required.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
              <p>
                For privacy inquiries, contact us at <a href="mailto:support@dropshops.space" className="text-primary hover:underline">support@dropshops.space</a>.
              </p>

              <div className="mt-12 p-4 border border-muted rounded-lg">
                <p className="font-medium mb-2">Related Legal Documents:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><Link to="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
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

export default Privacy;
