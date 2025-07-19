import React, { useState, useCallback } from 'react';
// 1. IMPORT useLocation FROM REACT-ROUTER-DOM
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../context/AuthContext';

// Constants for better maintainability
const ROUTES = {
  HOME: '/',
  KNOWLEDGEBASE: '/knowledge-base',
  MARKETPLACE: '/marketplace',
  SHOWCASE: '/showcase',
  CREATE: '/create',
  PROFILE: '/profile',
  LOGIN: '/login'
};

const NAVIGATION_ITEMS = [
  { to: ROUTES.KNOWLEDGEBASE, label: 'Knowledge Base' },
  { to: ROUTES.MARKETPLACE, label: 'Marketplace' },
  { to: ROUTES.SHOWCASE, label: 'Showcase' }
];

// Reusable Icon component (your code, no changes needed)
const Icon = ({ path, className = '', ariaLabel }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor"
    className={`header-icon ${className}`}
    aria-label={ariaLabel}
    role="img"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  SEARCH: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  CREATE: "M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  USER: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  MENU: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  CLOSE: "M6 18L18 6M6 6l12 12"
};

// ActionButton component (your code, no changes needed)
const ActionButton = ({ onClick, to, children, className = '', ariaLabel, ...props }) => {
  const baseClass = `action-button ${className}`;
  if (to) {
    return (
      <Link to={to} className={baseClass} aria-label={ariaLabel} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={baseClass} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  );
};

const Header = React.memo(() => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 2. GET THE CURRENT LOCATION OBJECT
  const location = useLocation();

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const handleSearchClick = useCallback(() => console.log('Search clicked'), []);

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <Link 
          to={ROUTES.HOME} 
          className="header-logo-link"
          aria-label="BlenderForge - Go to homepage"
        >
          <span className="header-title">BlenderForge</span>
        </Link>
        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          {NAVIGATION_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} className="nav-link">
              {label}
            </NavLink>
          ))}
        </nav>
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <Icon path={isMobileMenuOpen ? ICONS.CLOSE : ICONS.MENU} />
        </button>
        <div className="header-actions">
          {/*
          <ActionButton onClick={handleSearchClick} className="search-btn" ariaLabel="Search">
            <Icon path={ICONS.SEARCH} /><span>Search</span>
          </ActionButton>
          */}
          {user ? (
            <>
              <ActionButton to={ROUTES.CREATE} className="create-btn" ariaLabel="Create new content">
                <Icon path={ICONS.CREATE} /><span>Create</span>
              </ActionButton>
              <ActionButton to={ROUTES.PROFILE} className="signin-link" ariaLabel="View your profile">
                <Icon path={ICONS.USER} /><span>Profile</span>
              </ActionButton>
            </>
          ) : (
            // --- FIX FOR DESKTOP BUTTON ---
            <ActionButton 
              to={ROUTES.LOGIN} 
              className="signin-link" 
              ariaLabel="Sign in to your account"
              state={{ from: location }} // Pass the current location as state
            >
              <Icon path={ICONS.USER} /><span>Sign In</span>
            </ActionButton>
          )}
        </div>
      </div>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`}>
        <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
          {NAVIGATION_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} className="mobile-nav-link" onClick={closeMobileMenu}>
              {label}
            </NavLink>
          ))}
          <div className="mobile-actions">
            {user ? (
              <>
                <ActionButton to={ROUTES.CREATE} className="mobile-action-btn create-btn" onClick={closeMobileMenu} ariaLabel="Create new content">
                  <Icon path={ICONS.CREATE} /><span>Create</span>
                </ActionButton>
                <ActionButton to={ROUTES.PROFILE} className="mobile-action-btn" onClick={closeMobileMenu} ariaLabel="View your profile">
                  <Icon path={ICONS.USER} /><span>Profile</span>
                </ActionButton>
              </>
            ) : (
              // --- FIX FOR MOBILE BUTTON ---
              <ActionButton 
                to={ROUTES.LOGIN} 
                className="mobile-action-btn" 
                onClick={closeMobileMenu} 
                ariaLabel="Sign in to your account"
                state={{ from: location }} // Pass the current location as state here too
              >
                <Icon path={ICONS.USER} /><span>Sign In</span>
              </ActionButton>
            )}
            {/*
            <ActionButton onClick={handleSearchClick} className="mobile-action-btn" ariaLabel="Search">
              <Icon path={ICONS.SEARCH} /><span>Search</span>
            </ActionButton>
            */}
          </div>
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;