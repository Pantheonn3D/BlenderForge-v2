import React, { useState, useEffect } from 'react';
import './SocialBlock.css';

const SOCIAL_PLATFORMS = {
  twitter: { name: 'Twitter', color: '#1da1f2' },
  instagram: { name: 'Instagram', color: '#e4405f' },
  youtube: { name: 'YouTube', color: '#ff0000' },
  tiktok: { name: 'TikTok', color: '#000000' },
  linkedin: { name: 'LinkedIn', color: '#0077b5' },
  facebook: { name: 'Facebook', color: '#1877f2' },
  discord: { name: 'Discord', color: '#7289da' },
  twitch: { name: 'Twitch', color: '#9146ff' },
  github: { name: 'GitHub', color: '#181717' },
  behance: { name: 'Behance', color: '#1769ff' },
  dribbble: { name: 'Dribbble', color: '#ea4c89' },
  artstation: { name: 'ArtStation', color: '#13aff0' }
};

const SocialBlock = ({ initialData, onUpdate, onRemove }) => {
  const [socialLinks, setSocialLinks] = useState(initialData.socialLinks || []);
  const [title, setTitle] = useState(initialData.title || 'Follow me on social media');
  const [showInArticle, setShowInArticle] = useState(initialData.showInArticle !== false);

  useEffect(() => {
    onUpdate({
      socialLinks,
      title,
      showInArticle
    });
  }, [socialLinks, title, showInArticle, onUpdate]);

  const addSocialLink = (platform) => {
    if (!socialLinks.find(link => link.platform === platform)) {
      setSocialLinks([...socialLinks, { platform, url: '', username: '' }]);
    }
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const getPlatformIcon = (platformKey) => {
    switch (platformKey) {
      case 'twitter':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'github':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 2H7C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4z"/>
            <path d="M9 17H7v-7h2v7zm-1-7.9c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zm8 7.9h-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-2v-7h2v1.2c.5-.8 1.6-1.2 2.5-1.2 1.9 0 3.5 1.6 3.5 3.5v3.5z"/>
          </svg>
        );
    }
  };

  return (
    <div className="social-block">
      <div className="social-block-header">
        <h3>Social Media Block</h3>
        <div className="social-block-toggle">
          <label>
            <input
              type="checkbox"
              checked={showInArticle}
              onChange={(e) => setShowInArticle(e.target.checked)}
            />
            Show in article
          </label>
        </div>
      </div>

      <div className="social-form">
        <div className="form-group">
          <label htmlFor="social-title">Title</label>
          <input
            id="social-title"
            type="text"
            placeholder="Follow me on social media"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Add Social Platforms</label>
          <div className="platform-selector">
            {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
              <button
                key={key}
                type="button"
                className={`platform-option ${socialLinks.find(link => link.platform === key) ? 'active' : ''}`}
                onClick={() => addSocialLink(key)}
                style={{ '--platform-color': platform.color }}
                disabled={socialLinks.find(link => link.platform === key)}
              >
                <span className="platform-icon">{getPlatformIcon(key)}</span>
                <span className="platform-name">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="social-links-list">
          {socialLinks.map((link, index) => (
            <div key={index} className="social-link-item">
              <div className="social-link-header">
                <span className="platform-badge" style={{ '--platform-color': SOCIAL_PLATFORMS[link.platform].color }}>
                  {getPlatformIcon(link.platform)} {SOCIAL_PLATFORMS[link.platform].name}
                </span>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="remove-link-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="social-link-inputs">
                <input
                  type="text"
                  placeholder="Username"
                  className="form-input"
                  value={link.username}
                  onChange={(e) => updateSocialLink(index, 'username', e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Full URL"
                  className="form-input"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInArticle && socialLinks.length > 0 && (
        <div className="social-preview">
          <h4>Preview:</h4>
          <div className="social-card">
            <h5>{title}</h5>
            <div className="social-links">
              {socialLinks.filter(link => link.url).map((link, index) => (
                <div key={index} className="social-link" style={{ '--platform-color': SOCIAL_PLATFORMS[link.platform].color }}>
                  <span className="social-icon">{getPlatformIcon(link.platform)}</span>
                  <span className="social-name">{SOCIAL_PLATFORMS[link.platform].name}</span>
                  {link.username && <span className="social-username">@{link.username}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialBlock;