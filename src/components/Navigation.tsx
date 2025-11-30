import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, History, LogOut, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOutWithGuestMode, isGuestMode } from '@/services/authService';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

/**
 * Navigation Component
 * Provides navigation links between different pages with glass morphism and mobile menu
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const guestMode = isGuestMode();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOutWithGuestMode();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/history', label: 'History', icon: History },
    { to: '/pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {guestMode && (
              <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10">
                Guest Mode
              </Badge>
            )}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300',
                  isActive(to)
                    ? 'bg-neon-green/10 text-neon-green glow-green'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>{guestMode ? 'Exit Guest Mode' : 'Sign Out'}</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 glass-strong animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {guestMode && (
              <div className="px-4 py-2">
                <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10">
                  Guest Mode
                </Badge>
              </div>
            )}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all',
                  isActive(to)
                    ? 'bg-neon-green/10 text-neon-green glow-green'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleSignOut();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>{guestMode ? 'Exit Guest Mode' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
