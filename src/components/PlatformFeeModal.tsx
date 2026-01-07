import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HelpCircle, Shield, Server, Zap } from 'lucide-react';

interface PlatformFeeModalProps {
  children: React.ReactNode;
}

export function PlatformFeeModal({ children }: PlatformFeeModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Why Platform Fees?
          </DialogTitle>
          <DialogDescription>
            Understanding our transparent fee structure
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Secure Infrastructure</h4>
                <p className="text-xs text-muted-foreground">
                  Maintaining secure payment processing, fraud protection, and reliable uptime
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Platform Development</h4>
                <p className="text-xs text-muted-foreground">
                  Continuous improvements, new features, and technical support
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Innovation & Growth</h4>
                <p className="text-xs text-muted-foreground">
                  Funding new tools, integrations, and platform expansion
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <span className="text-xs font-medium text-blue-700">Fair & Transparent</span>
            </div>
            <p className="text-xs text-blue-600">
              Our 2% fee is only applied to donations and helps keep the platform sustainable while ensuring the majority of your payment goes directly to the merchant.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for supporting a fair and sustainable payment ecosystem! 🙏
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}