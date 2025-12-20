import { Link } from 'react-router-dom';
import { Store, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

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
              <li><a href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About Us</a></li>
              <li><a href="/careers" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Careers</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</a></li>
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
        </div>
      </div>
    </footer>
  );
}