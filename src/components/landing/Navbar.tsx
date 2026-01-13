import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Store } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow bg-transparent">
              <img src="https://i.ibb.co/rRN0sS7y/favicon.png" alt="App Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Drop Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </a>
            <Link to="/stores" className="text-muted-foreground hover:text-foreground transition-colors">
              Store Directory
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button className="gradient-hero shadow-glow hover:opacity-90 transition-opacity" asChild>
              <Link to="/auth">Start Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#templates"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Templates
              </a>
              <Link
                to="/stores"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Store Directory
              </Link>
              <a
                href="/templates"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              <Link
                to="/help"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Help
              </Link>
              <Link
                to="/support"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Support
              </Link>
              <a
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </a>
              
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
                <Button className="gradient-hero" asChild>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Start Free</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}