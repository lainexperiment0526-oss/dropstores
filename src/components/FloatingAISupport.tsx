import { Button } from '@/components/ui/button';
import { MessageSquare, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FloatingAISupportProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export function FloatingAISupport({ variant = 'floating', className = '' }: FloatingAISupportProps) {
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          asChild
          className="rounded-full w-14 h-14 shadow-lg gradient-hero hover:scale-105 transition-all duration-200"
          title="AI Support Assistant"
        >
          <Link to="/support">
            <Bot className="w-6 h-6" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" asChild className={className}>
      <Link to="/support">
        <MessageSquare className="w-4 h-4 mr-2" />
        AI Support
      </Link>
    </Button>
  );
}