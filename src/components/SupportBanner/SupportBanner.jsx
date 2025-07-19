import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SupportBanner.css';

const SupportBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner has been dismissed in this session
    const isDismissed = sessionStorage.getItem('supportBannerDismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem('supportBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="support-banner-wrapper">
      <Link to="/support" className="support-banner" aria-label="Learn more about supporting BlenderForge">
        <div className="banner-content">
          <p className="banner-text">
            <span className="banner-text-normal">
              BlenderForge is a community-driven platform.
            </span>
            <span className="banner-text-link">
              Become a Forge Supporter to help us grow!
            </span>
          </p>
        </div>
        
        {/* The entire <button> element has been removed */}
        
      </Link>
    </div>
  );
};

export default SupportBanner;