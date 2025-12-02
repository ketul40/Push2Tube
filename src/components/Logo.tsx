import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo Component
 * Reusable logo component that links to home page
 * Used across all pages for consistent branding
 */
const Logo: React.FC = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2 text-xl font-bold tracking-tight transition-all hover:scale-105"
    >
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-green blur-lg opacity-50"></div>
          <span className="relative text-neon-green text-glow-green">PUSH</span>
        </div>
        <span className="text-neon-cyan text-glow-cyan">2</span>
        <span className="text-white">TUBE</span>
      </div>
    </Link>
  );
};

export default Logo;


