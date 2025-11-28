import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

/**
 * Navigation Component
 * Provides navigation links between different pages
 */
const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">Push2Tube</Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={isActive('/history') ? 'active' : ''}
            >
              History
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
