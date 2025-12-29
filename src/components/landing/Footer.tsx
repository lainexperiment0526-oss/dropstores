import { Link } from 'react-router-dom';
import { Store, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Powered by <a href="https://droplink.space/auth" className="text-primary font-semibold" target="_blank" rel="noopener noreferrer">Droplink</a> under <span className="text-primary font-semibold">Mrwain Organization</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span>Pi Network Mainnet</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</a></li>
              <li><a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Templates</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Integrations</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="https://www.droplink.space/developers" className="text-muted-foreground hover:text-foreground transition-colors text-sm" target="_blank" rel="noopener noreferrer">Documentation</a></li>
              <li><a href="https://www.droplink.space/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm" target="_blank" rel="noopener noreferrer">Blog</a></li>
              <li><a href="https://www.droplink.space/help" className="text-muted-foreground hover:text-foreground transition-colors text-sm" target="_blank" rel="noopener noreferrer">Help Center</a></li>
              <li><a href="https://www.droplink.space/community-guidelines" className="text-muted-foreground hover:text-foreground transition-colors text-sm" target="_blank" rel="noopener noreferrer">Community</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About Us</Link></li>
              <li><Link to="/AboutPiSupplier" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pi Supplier Program</Link></li>
              <li><a href="/careers" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Careers</a></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/business" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Business Guidelines</Link></li>
              <li><Link to="/prohibited" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Prohibited Activities</Link></li>
              <li><Link to="/gdpr" className="text-muted-foreground hover:text-foreground transition-colors text-sm">GDPR</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Drop Store. Powered by Droplink under Mrwain Organization. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Built on Pi Network Mainnet • Accept Pi Payments
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">Software License</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Software License</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto text-left">
                  <p><strong>Copyright (C) 2025 MRWAIN ORGANIZATION</strong></p>
                  <p>
                    Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.
                  </p>
                  <p>
                    For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate. However, you are prohibited from using any portion of the Software or any derivative works thereof in any manner (a) which infringes on any Pi Network intellectual property rights, (b) to hack any of Pi Network’s systems or processes or (c) to develop any product or service which is competitive with the Pi Network.
                  </p>
                  <p>
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                  </p>
                  <p>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </p>
                  <p>
                    Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.
                  </p>
                  <p><strong>Copyright (C) 2025 MRWAIN ORGANIZATION</strong></p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}