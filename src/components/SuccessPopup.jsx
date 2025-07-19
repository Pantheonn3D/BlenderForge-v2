import React, { useState, useEffect, useCallback } from 'react';
import './SuccessPopup.css';

const SuccessPopup = ({ 
  isVisible, 
  message = "Success!", 
  onClose,
  duration = 5000 // 5 seconds is a good default for toasts
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    // Wait for the slide-out animation to complete before calling onClose
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false); // Reset for next time
    }, 400);
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast-notification ${isAnimatingOut ? 'animate-out' : 'animate-in'}`}>
      <div className="toast-icon">
        ✓
      </div>
      <div className="toast-content">
        <p className="toast-title">Success</p>
        <p className="toast-message">{message}</p>
      </div>
      <button 
        className="toast-close-button" 
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
      <div 
        className="toast-progress-bar"
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
};

export default SuccessPopup;