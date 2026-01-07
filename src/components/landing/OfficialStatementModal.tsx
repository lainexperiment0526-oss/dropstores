import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';

export function OfficialStatementModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Official Statement
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Official Statement - Drop Store Platform
          </DialogTitle>
          <DialogDescription>
            Legal declarations and platform compliance information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Platform Declaration */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold">Platform Declaration</h3>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-medium">Drop Store is an officially registered Pi Network application.</p>
              <p className="text-muted-foreground">
                This platform operates in full compliance with Pi Network's developer guidelines and mainnet requirements. 
                All Pi transactions are processed through official Pi Network protocols.
              </p>
            </div>
          </section>

          {/* Compliance Information */}
          <section className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Badge variant="secondary">Compliance</Badge>
              Regulatory Information
            </h3>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">🛡️ Security & Privacy</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• GDPR compliant data processing</li>
                  <li>• End-to-end encrypted transactions</li>
                  <li>• No personal data sold to third parties</li>
                  <li>• Secure wallet integration protocols</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-3">
                <h4 className="font-medium mb-2">⚖️ Legal Framework</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Operating under digital commerce regulations</li>
                  <li>• KYC/AML compliance for merchant accounts</li>
                  <li>• Consumer protection standards</li>
                  <li>• International e-commerce guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pi Network Integration */}
          <section className="space-y-3">
            <h3 className="font-semibold">🔗 Pi Network Integration</h3>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <p className="font-medium">Authorized Pi Network Application</p>
              <p className="text-muted-foreground">
                Drop Store is built using official Pi Network SDKs and APIs. All payment processing utilizes 
                the Pi Network's secure blockchain infrastructure. We maintain strict adherence to Pi Network's 
                terms of service and developer agreements.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Connected to Pi Mainnet</span>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="space-y-3">
            <h3 className="font-semibold">👤 User Rights & Protections</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Data Ownership</p>
                  <p className="text-muted-foreground text-xs">You retain full ownership of your store data and content</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Platform Independence</p>
                  <p className="text-muted-foreground text-xs">Export your data and migrate at any time</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-background border rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Fair Usage</p>
                  <p className="text-muted-foreground text-xs">Transparent pricing with no hidden fees</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-3">
            <h3 className="font-semibold">📞 Official Contact</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p><strong>Legal Entity:</strong> MrWain Organization</p>
              <p><strong>Platform:</strong> Drop Store</p>
              <p><strong>Support:</strong> support@dropshops.space</p>
              <p><strong>Legal Inquiries:</strong> legal@dropshops.space</p>
              <div className="flex items-center gap-2 mt-3">
                <a 
                  href="https://droplink.space" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Official Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Last Updated: January 7, 2026 | Version 2.0
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}