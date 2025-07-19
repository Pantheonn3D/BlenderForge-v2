import React from 'react';
import PropTypes from 'prop-types';
import './SectionHeader.css';

const SectionHeader = ({ 
  title, 
  subtitle,
  buttonText, 
  buttonLink, 
  onButtonClick,
  buttonVariant = 'secondary',
  buttonIcon,
  isLoading = false,
  disabled = false,
  className = '',
  titleLevel = 2,
  showButton = true
}) => {
  const TitleTag = `h${titleLevel}`;
  
  const handleButtonClick = (e) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    
    if (onButtonClick) {
      e.preventDefault();
      onButtonClick(e);
    }
  };

  const renderButton = () => {
    if (!showButton || !buttonText) return null;

    const buttonProps = {
      className: `section-header-btn ${buttonVariant} ${disabled ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`,
      onClick: handleButtonClick,
      disabled: disabled || isLoading,
      'aria-label': isLoading ? 'Loading...' : buttonText
    };

    const buttonContent = (
      <>
        {isLoading && <div className="button-spinner" />}
        {buttonIcon && !isLoading && <span className="button-icon">{buttonIcon}</span>}
        <span className="button-text">{buttonText}</span>
        {buttonVariant === 'secondary' && !isLoading && (
          <svg className="button-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </>
    );

    if (buttonLink && !onButtonClick) {
      return (
        <a href={buttonLink} {...buttonProps}>
          {buttonContent}
        </a>
      );
    }

    return (
      <button {...buttonProps}>
        {buttonContent}
      </button>
    );
  };

  return (
    <div className={`section-header-container ${className}`}>
      <div className="section-header-content">
        <TitleTag className="section-title">{title}</TitleTag>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {renderButton()}
    </div>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  buttonText: PropTypes.string,
  buttonLink: PropTypes.string,
  onButtonClick: PropTypes.func,
  buttonVariant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  buttonIcon: PropTypes.node,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  titleLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  showButton: PropTypes.bool
};

SectionHeader.defaultProps = {
  subtitle: null,
  buttonText: null,
  buttonLink: null,
  onButtonClick: null,
  buttonVariant: 'secondary',
  buttonIcon: null,
  isLoading: false,
  disabled: false,
  className: '',
  titleLevel: 2,
  showButton: true
};

export default SectionHeader;