import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Briefcase, AlertTriangle } from 'lucide-react';
import React from 'react';

export default function TermsPrivacyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto align-baseline text-xs font-medium">Terms, Privacy & Guidelines</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Drop Store Legal & Guidelines
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="terms" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Terms
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Business
            </TabsTrigger>
            <TabsTrigger value="prohibited" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Prohibited
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="terms" className="space-y-4 text-sm text-muted-foreground pr-4">
              <h3 className="font-semibold text-foreground text-base">Terms of Service</h3>
              <p className="text-xs text-muted-foreground">Last updated: December 2024</p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">1. Acceptance of Terms</h4>
                <p>By accessing or using Drop Store, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.</p>
                
                <h4 className="font-medium text-foreground">2. Account Responsibilities</h4>
                <p>You are responsible for maintaining the confidentiality of your Pi Network account and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>
                
                <h4 className="font-medium text-foreground">3. Merchant Obligations</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Provide accurate product descriptions and pricing</li>
                  <li>Fulfill orders in a timely manner</li>
                  <li>Respond to customer inquiries within 48 hours</li>
                  <li>Maintain accurate inventory counts</li>
                  <li>Process refunds as per your stated policy</li>
                  <li>Comply with all applicable local laws and regulations</li>
                </ul>
                
                <h4 className="font-medium text-foreground">4. Payment Terms</h4>
                <p>All transactions are processed through Pi Network. Merchants receive payments directly to their configured Pi wallet. Drop Store charges subscription fees as per the selected plan.</p>
                
                <h4 className="font-medium text-foreground">5. Subscription & Billing</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Subscriptions are billed monthly in Pi cryptocurrency</li>
                  <li>No refunds for partial months</li>
                  <li>Plans can be upgraded at any time</li>
                  <li>Downgrade takes effect at next billing cycle</li>
                </ul>
                
                <h4 className="font-medium text-foreground">6. Termination</h4>
                <p>We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or fail to maintain subscription payments.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4 text-sm text-muted-foreground pr-4">
              <h3 className="font-semibold text-foreground text-base">Privacy Policy</h3>
              <p className="text-xs text-muted-foreground">Last updated: December 2024</p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">1. Information We Collect</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pi Network username and wallet address</li>
                  <li>Store information (name, description, products)</li>
                  <li>Transaction history and order data</li>
                  <li>Customer information provided during checkout</li>
                  <li>Usage data and analytics</li>
                </ul>
                
                <h4 className="font-medium text-foreground">2. How We Use Your Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Process transactions and manage your store</li>
                  <li>Provide customer support</li>
                  <li>Improve our platform and services</li>
                  <li>Send important notifications about your account</li>
                  <li>Detect and prevent fraud</li>
                </ul>
                
                <h4 className="font-medium text-foreground">3. Data Protection</h4>
                <p>We implement industry-standard security measures to protect your data. All transactions are processed securely through Pi Network's blockchain.</p>
                
                <h4 className="font-medium text-foreground">4. Data Sharing</h4>
                <p>We do not sell your personal information. We may share data with:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pi Network for payment processing</li>
                  <li>Law enforcement when required by law</li>
                  <li>Service providers who assist our operations</li>
                </ul>
                
                <h4 className="font-medium text-foreground">5. Your Rights</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access your personal data</li>
                  <li>Request data correction or deletion</li>
                  <li>Export your store data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                
                <h4 className="font-medium text-foreground">6. Contact</h4>
                <p>For privacy concerns, contact us at privacy@dropstore.app</p>
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4 text-sm text-muted-foreground pr-4">
              <h3 className="font-semibold text-foreground text-base">Business Guidelines</h3>
              <p className="text-xs text-muted-foreground">Building Trust in the Pi Economy</p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">1. Legitimate Business Requirements</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Only sell products/services you can actually deliver</li>
                  <li>Maintain verifiable inventory for physical products</li>
                  <li>Provide clear and accurate product descriptions</li>
                  <li>Use real photos of your actual products</li>
                  <li>Set realistic delivery timeframes</li>
                </ul>
                
                <h4 className="font-medium text-foreground">2. Pricing Standards</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Price products fairly in Pi</li>
                  <li>No price manipulation or artificial inflation</li>
                  <li>Clearly display all fees and shipping costs</li>
                  <li>Honor advertised prices and promotions</li>
                </ul>
                
                <h4 className="font-medium text-foreground">3. Customer Service Standards</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Respond to customer inquiries within 48 hours</li>
                  <li>Process orders within stated timeframes</li>
                  <li>Provide tracking information for shipped orders</li>
                  <li>Handle disputes professionally and fairly</li>
                  <li>Offer reasonable refund/return policies</li>
                </ul>
                
                <h4 className="font-medium text-foreground">4. Quality Assurance</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Ensure products match their descriptions</li>
                  <li>Package items properly to prevent damage</li>
                  <li>Include receipts and contact information</li>
                  <li>Stand behind your products with warranties when applicable</li>
                </ul>
                
                <h4 className="font-medium text-foreground">5. Verification Program</h4>
                <p>Merchants with consistent positive ratings and verified business practices may qualify for our Verified Merchant badge, increasing customer trust.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="prohibited" className="space-y-4 text-sm text-muted-foreground pr-4">
              <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Prohibited Activities & Products
              </h3>
              <p className="text-xs text-muted-foreground">Violations result in immediate account termination</p>
              
              <div className="space-y-3">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <h4 className="font-medium text-destructive">ZERO TOLERANCE FOR SCAMS</h4>
                  <p className="text-sm mt-1">Drop Store has zero tolerance for fraudulent activity. Scammers will be permanently banned and reported to Pi Network.</p>
                </div>
                
                <h4 className="font-medium text-foreground">Prohibited Activities</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Selling products you don't possess or can't deliver</li>
                  <li>Creating fake orders or reviews</li>
                  <li>Manipulating prices or Pi exchange rates</li>
                  <li>Collecting payments without fulfilling orders</li>
                  <li>Using fake product images or descriptions</li>
                  <li>Impersonating other businesses or individuals</li>
                  <li>Money laundering or suspicious financial activity</li>
                  <li>Pyramid schemes or multi-level marketing scams</li>
                </ul>
                
                <h4 className="font-medium text-foreground">Prohibited Products</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Illegal drugs or controlled substances</li>
                  <li>Weapons, firearms, or explosives</li>
                  <li>Counterfeit or stolen goods</li>
                  <li>Adult content or services</li>
                  <li>Gambling services</li>
                  <li>Endangered species products</li>
                  <li>Hazardous materials</li>
                  <li>Personal data or hacked accounts</li>
                  <li>Unlicensed financial products</li>
                </ul>
                
                <h4 className="font-medium text-foreground">Reporting Violations</h4>
                <p>If you encounter suspicious activity or prohibited products, report immediately to: report@dropstore.app</p>
                
                <h4 className="font-medium text-foreground">Consequences</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>First offense: Warning and product removal</li>
                  <li>Second offense: Temporary suspension</li>
                  <li>Serious violations: Permanent ban</li>
                  <li>Fraud/scams: Immediate permanent ban + Pi Network report</li>
                </ul>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
