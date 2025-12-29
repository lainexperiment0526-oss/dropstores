import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

const Prohibited = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Prohibited Activities</h1>
            <div className="mb-8 p-4 border-l-4 border-primary bg-primary/5 rounded-md">
              <p className="mb-3 font-medium">Maintaining a Safe and Compliant Marketplace</p>
              <p className="text-muted-foreground mb-4">
                Drop Store prohibits a wide range of activities to maintain a safe, trustworthy, and compliant platform for all users. Violations may result in account suspension or termination.
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">Last updated: December 2024</p>

              <div className="my-8 p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium">Summary:</p>
                <p>
                  Prohibited activities include illegal operations, intellectual property violations, fraud, platform abuse, harmful content, privacy violations, financial misconduct, harassment, competitive abuse, and regulatory non-compliance.
                  Violations result in account termination and potential legal action.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Illegal Activities</h2>
              <p>Users may not use Drop Store for any illegal activities, including:</p>
              <div className="space-y-4 mt-6">
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Criminal Operations</h3>
                  <p className="text-sm">Selling illegal goods, money laundering, drug trafficking, human trafficking, fraud, or counterfeiting.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property Violations</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Counterfeit Goods</h3>
                  <p className="text-sm">Selling unauthorized, pirated, or counterfeited items.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Trademark Infringement</h3>
                  <p className="text-sm">Using others' trademarks, brand names, or logos without permission.</p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Piracy</h3>
                  <p className="text-sm">Selling pirated software or copyrighted content.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Fraud and Deception</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Misleading Listings</h3>
                  <p className="text-sm">Fake product listings, misrepresented items, or misleading descriptions.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Fake Reviews</h3>
                  <p className="text-sm">Using fraudulent reviews or testimonials to deceive customers.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Phishing & Scams</h3>
                  <p className="text-sm">Phishing, social engineering, or account hijacking.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Hidden Charges</h3>
                  <p className="text-sm">Misleading pricing or hidden fees not disclosed upfront.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Platform Abuse</h2>
              <p>Users may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use automated bots or scrapers to collect data</li>
                <li>Attempt to hack, disrupt, or damage the platform</li>
                <li>Spam or flood the platform with unwanted messages</li>
                <li>Manipulate search results or artificially inflate ratings</li>
                <li>Exploit platform vulnerabilities or glitches</li>
                <li>Engage in DDoS attacks or other cyber attacks</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Harmful and Dangerous Content</h2>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Weapons & Explosives</h3>
                  <p className="text-sm">Selling weapons or explosives unless legally authorized.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Hacking Services</h3>
                  <p className="text-sm">Offering hacking, cracking, or malware services.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Hate & Violence</h3>
                  <p className="text-sm">Content promoting violence, hate, discrimination, or illegal activities.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Harassment</h3>
                  <p className="text-sm">Facilitating harassment, bullying, or defamation.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Privacy and Data Violations</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Collecting or sharing customer data without consent</li>
                <li>Selling personal information to third parties</li>
                <li>Violating data protection regulations (including GDPR)</li>
                <li>Unauthorized access to user accounts or systems</li>
                <li>Harvesting or scraping user data</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Financial Misconduct</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chargebacks for legitimate transactions</li>
                <li>Creating false payment disputes</li>
                <li>Unauthorized credit card use</li>
                <li>Money laundering through Pi Network</li>
                <li>Tax evasion or unreported income</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Harassment and Abuse</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Threatening, intimidating, or harassing other users</li>
                <li>Posting abusive, hateful, or discriminatory content</li>
                <li>Cyberstalking or persistent unwanted contact</li>
                <li>Doxxing or sharing others' private information</li>
                <li>Sexual harassment or exploitation</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Competitive Abuse</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sabotaging competitors' listings or accounts</li>
                <li>Creating fake negative reviews of competitors</li>
                <li>Spreading false information about other merchants</li>
                <li>Price fixing or collusion</li>
                <li>Impersonating other users or businesses</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Regulatory Non-Compliance</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violating Pi Network terms or policies</li>
                <li>Non-compliance with gaming, gambling, or betting regulations</li>
                <li>Offering unlicensed financial services or investments</li>
                <li>Selling restricted items by local or international law</li>
                <li>Operating without required business licenses or permits</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Consequences of Violations</h2>
              <p>Users engaging in prohibited activities may face:</p>
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Account Suspension</h3>
                  <p className="text-sm">Immediate account suspension or permanent termination.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Content Removal</h3>
                  <p className="text-sm">Removal of listings or content.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Fund Forfeiture</h3>
                  <p className="text-sm">Loss of payment access or funds.</p>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">Legal Action</h3>
                  <p className="text-sm">Legal action and cooperation with authorities.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Report Violations</h2>
              <p>
                If you encounter prohibited activities on Drop Store, please report them to <a href="mailto:support@dropshops.space" className="text-primary hover:underline">support@dropshops.space</a> with detailed information. We take all reports seriously and investigate appropriately.
              </p>

              <div className="mt-12 p-4 border border-muted rounded-lg">
                <p className="font-medium mb-2">Related Legal Documents:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><Link to="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
                  <li><Link to="/business" className="text-primary hover:underline">Business Guidelines</Link></li>
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

export default Prohibited;
