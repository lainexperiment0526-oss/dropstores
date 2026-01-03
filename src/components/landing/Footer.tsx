import { Link } from 'react-router-dom';
import { Store, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-3">
              Pi-powered e-commerce platform for the decentralized economy.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by{' '}
              <a 
                href="https://droplink.space" 
                className="text-primary hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Droplink
              </a>
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Templates
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Store Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://droplink.space/developers" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm inline-flex items-center gap-1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Docs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/AboutPiSupplier" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Pi Supplier
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  GDPR
                </Link>
              </li>
              <li>
                <Link to="/business" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Business
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Drop Store by MrWain Organization
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Pi Mainnet
              </span>
              <a 
                href="https://droplink.space" 
                className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Droplink <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
