import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

export function SoftwareLicenseModal() {
  const [open, setOpen] = useState(false);

  const licenseText = `Software License
Copyright (C) 2025 MRWAIN ORGANIZATION

Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.

For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate. However, you are prohibited from using any portion of the Software or any derivative works thereof in any manner (a) which infringes on any Pi Network intellectual property rights, (b) to hack any of Pi Network's systems or processes or (c) to develop any product or service which is competitive with the Pi Network.

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.

Copyright (C) 2025 MRWAIN ORGANIZATION`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Software License
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Drop Store Software License
          </DialogTitle>
          <DialogDescription>
            Official software license for Drop Store platform - MRWAIN ORGANIZATION
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* License Header */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div>
              <h3 className="font-semibold text-primary">Pi Network Compatible License</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Copyright (C) 2025 MRWAIN ORGANIZATION
              </p>
            </div>
          </div>

          {/* License Text */}
          <ScrollArea className="h-[400px] w-full">
            <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {licenseText}
            </div>
          </ScrollArea>

          {/* Key Points */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 p-3 bg-background border rounded-lg">
              <h4 className="font-medium text-green-600">✅ Permitted Uses</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use, copy, and modify for Pi Network apps</li>
                <li>• Distribute and sublicense derivative works</li>
                <li>• Commercial use for Pi Network platform</li>
                <li>• Create applications for official Pi Network</li>
              </ul>
            </div>
            
            <div className="space-y-2 p-3 bg-background border rounded-lg">
              <h4 className="font-medium text-red-600">❌ Restrictions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• No Pi Network IP infringement</li>
                <li>• No hacking Pi Network systems</li>
                <li>• No competitive products to Pi Network</li>
                <li>• Must include copyright notice</li>
              </ul>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-medium text-yellow-600 mb-2">⚠️ Important Notice</h4>
            <p className="text-sm text-muted-foreground">
              This software is specifically licensed for Pi Network ecosystem development. 
              Pi, Pi Network and the Pi logo are trademarks of Pi Community Company.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}