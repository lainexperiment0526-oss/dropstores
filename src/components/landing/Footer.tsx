import { Link } from 'react-router-dom';
import { Store, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

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
          <div className="mt-4 flex items-center justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">Official Statement</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>MrWain Organization - Official Statement</DialogTitle>
                </DialogHeader>
                
                {/* Modal Content */}
                <div className="p-6 space-y-6 text-sm text-gray-700 leading-relaxed">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Declaration of Independence</h3>
                    <p>
                      The <strong>MrWain Organization</strong> operates as a fully independent, private institution with no affiliation, partnership, endorsement, or collaboration with any local or international government, governmental agency, regulatory body, or state-sponsored entity whatsoever.
                    </p>

                    <p>
                      We maintain a strict policy of non-participation in any governmental program, project, initiative, or partnership. This unwavering commitment to independence ensures the complete autonomy, privacy, and security of our developers, founders, and the communities we serve.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Mission & Focus</h3>
                    <p>
                      The <strong>MrWain Organization</strong> is dedicated exclusively to the research, design, and development of innovative software applications within the Pi Network ecosystem, serving both current needs and future expansion of the decentralized economy.
                    </p>

                    <p>
                      Our mission is to deliver cutting-edge, secure, and high-quality digital solutions that generate tangible utility for the global Pi Network community. We are committed to advancing the ecosystem through technological innovation and practical application development.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Core Values & Commitment</h3>
                    <p>
                      As a proudly independent entity, the <strong>MrWain Organization</strong> upholds the highest standards of:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Ethical Development:</strong> Maintaining integrity and responsible practices in all development activities</li>
                      <li><strong>Technological Excellence:</strong> Delivering superior quality and innovative solutions</li>
                      <li><strong>Decentralization Principles:</strong> Full alignment with the foundational values of decentralized systems</li>
                      <li><strong>Transparency & Security:</strong> Ensuring open communication and robust protection for all users</li>
                      <li><strong>Community First:</strong> Creating a forward-thinking environment that empowers builders and creators</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-600 italic pt-4">
                    This statement reflects our organizational policy and is for informational purposes only; it does not constitute legal advice or a waiver of any rights or obligations.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mt-6">
                    <div className="text-center mb-6">
                      <p className="font-bold text-lg text-gray-900">© 2025 MrWain Organization</p>
                      <p className="text-sm text-gray-700 mt-2">All Rights Reserved</p>
                      <p className="mt-4 text-xs text-gray-600 italic">
                        This official statement is protected by copyright law. Unauthorized reproduction, distribution, modification, or use of this document or any portion thereof is strictly prohibited and may result in legal action.
                      </p>
                    </div>
                    
                    <div className="border-t border-blue-300 pt-4 mt-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-900">Officially Issued</p>
                          <p className="text-xs text-gray-600 mt-1">December 10, 2025</p>
                        </div>
                        
                        <div className="text-center mt-2">
                          <div className="font-signature text-2xl text-gray-800 mb-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                            MrWain Organization
                          </div>
                          <div className="h-px w-48 bg-gray-400 mx-auto"></div>
                          <p className="text-xs text-gray-600 mt-1">Authorized Signature</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-white border-t border-gray-200 p-6 flex justify-end gap-3 mt-6">
                  <DialogClose asChild>
                    <button
                      className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-secondary transition-colors"
                    >
                      Close
                    </button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">Droplink Ecosystem</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Droplink Ecosystem for Business and Creators</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  <div className="rounded-lg border bg-muted/60 p-4 text-sm text-muted-foreground">
                    Build, sell, and get paid across fully connected Pi apps. Choose one, two, or all three to match your goals.
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <p className="text-xs font-semibold text-primary mb-1">Awareness</p>
                      <h4 className="font-semibold text-foreground mb-2">Droplink</h4>
                      <p className="text-sm text-muted-foreground">Drive traffic, visibility, and buyers to your DropStore with one powerful link.</p>
                    </div>
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <p className="text-xs font-semibold text-primary mb-1">Storefront</p>
                      <h4 className="font-semibold text-foreground mb-2">DropStore</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Physical products</li>
                        <li>Digital products</li>
                        <li>Online services</li>
                        <li>All in one Pi-powered marketplace</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <p className="text-xs font-semibold text-primary mb-1">Payments</p>
                      <h4 className="font-semibold text-foreground mb-2">DropPay</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>Accept Pi payments</li>
                        <li>Create checkout links</li>
                        <li>Embed Pi payments on sites/widgets</li>
                        <li>Automated earnings and payouts</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Flow</p>
                    <p className="text-sm text-foreground font-medium mt-1">Exposure → Selling → Payment → Payout</p>
                    <p className="text-sm text-muted-foreground mt-2">Each app connects to the next, so you can scale from audience to revenue without switching stacks.</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <h5 className="text-sm font-semibold text-foreground">Creators & Influencers</h5>
                      <p className="text-sm text-muted-foreground mt-1">Use Droplink to grow reach and send buyers straight to your DropStore.</p>
                    </div>
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <h5 className="text-sm font-semibold text-foreground">Sellers & Merchants</h5>
                      <p className="text-sm text-muted-foreground mt-1">Showcase and sell in DropStore with seamless Pi checkout powered by DropPay.</p>
                    </div>
                    <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                      <h5 className="text-sm font-semibold text-foreground">Businesses</h5>
                      <p className="text-sm text-muted-foreground mt-1">Leverage DropPay for secure Pi payments, recurring earnings, and managed payouts.</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" size="sm">Software License</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Software License</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-lg border bg-muted/60 p-4 text-foreground font-semibold">
                    Copyright (C) 2025 MRWAIN ORGANIZATION
                  </div>
                  <p>
                    Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.
                  </p>
                  <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Permitted Use</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Use, copy, modify, merge, publish, distribute, sub-license, and/or sell derivative works.</li>
                      <li>Include this notice in all copies or substantial portions of the Software.</li>
                      <li>Purpose: build and market applications for the official Pi Network.</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border bg-card/80 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Restrictions</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Do not infringe on Pi Network intellectual property.</li>
                      <li>No hacking of Pi Network systems or processes.</li>
                      <li>Do not develop products or services competitive with Pi Network.</li>
                    </ul>
                  </div>
                  <p>
                    For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate.
                  </p>
                  <div className="rounded-lg border bg-muted/60 p-4 text-foreground">
                    <p className="font-semibold">AS IS WARRANTY</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.
                  </p>
                  <div className="rounded-lg border bg-muted/60 p-4 text-foreground font-semibold">
                    Copyright (C) 2025 MRWAIN ORGANIZATION
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}