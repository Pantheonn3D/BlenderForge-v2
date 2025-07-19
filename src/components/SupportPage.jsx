import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlatformSupportForm from './Support/PlatformSupportForm'; 
import './SupportPage.css';

const SupportPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const benefits = [
    {
      id: 'accelerate',
      title: 'Accelerate Development',
      description: 'Your support helps us dedicate more time to building the tools and features you love, faster.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      )
    },
    {
      id: 'content',
      title: 'Fuel More Content',
      description: 'Enable us to create more in-depth tutorials, articles, and high-quality assets for the community.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    {
      id: 'recognition',
      title: 'Get Recognized',
      description: 'As a thank you, your profile will be featured on our Forge Supporters page.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
      )
    }
  ];

  return (
    <div className={`support-page-container ${isVisible ? 'visible' : ''}`}>
      <header className="support-page-header">
        <h1 className="support-page-title">
          <span className="title-main">Support</span>
          <span className="title-highlight">BlenderForge</span>
        </h1>
        <p className="support-page-subtitle">
          Your contribution directly fuels the development of new features, tutorials, and community events. 
          Help us forge the future of Blender learning.
        </p>
      </header>

      <main className="support-page-content">
        <section className="why-support-section" aria-labelledby="why-support-heading">
          
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <article 
                key={benefit.id} 
                className="benefit-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="benefit-icon">
                  {benefit.icon}
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
                {benefit.id === 'recognition' && (
                  <Link 
                    to="/supporters" 
                    className="benefit-link"
                    aria-label="View our Forge Supporters page"
                  >
                    View Supporters
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7 7 17 7 17 17"/>
                    </svg>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="how-to-support-section" aria-labelledby="how-support-heading">
          <h2 id="how-support-heading" className="section-heading">Become a Forge Supporter</h2>
          <p className="section-description">
            Currently the only way to support us is through a $5 PayPal subscription, which helps us maintain the platform and create more content.
            Your support is crucial for the continued growth and improvement of BlenderForge. 
          </p>
          
          <div className="support-form-wrapper">
            <div className="support-form-container">
              <PlatformSupportForm />
            </div>
          </div>
        </section>

        <section className="additional-support-section">
          <h2 className="section-heading">Other Ways to Support</h2>
          <div className="other-support-grid">
            <div className="other-support-card">
              <div className="support-method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>Share & Engage</h3>
              <p>Help us grow by sharing our content and engaging with the community</p>
            </div>
            <div className="other-support-card">
              <div className="support-method-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h3>Contribute Content</h3>
              <p>Share your knowledge by writing tutorials and creating resources</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupportPage;