import React, { useState, useEffect } from 'react';
import './SupportBlock.css';

const SUPPORT_PLATFORMS = {
  paypal: { name: 'PayPal', color: '#0070ba' },
  kofi: { name: 'Ko-fi', color: '#ff5722' },
  buymeacoffee: { name: 'Buy Me a Coffee', color: '#ffdd00' },
  patreon: { name: 'Patreon', color: '#ff424d' },
  gofundme: { name: 'GoFundMe', color: '#00b964' },
  venmo: { name: 'Venmo', color: '#3d95ce' },
  cashapp: { name: 'Cash App', color: '#00d632' },
  custom: { name: 'Custom', color: '#6c757d' }
};

const SupportBlock = ({ initialData, onUpdate, onRemove }) => {
  const [platform, setPlatform] = useState(initialData.platform || 'paypal');
  const [url, setUrl] = useState(initialData.url || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [showInArticle, setShowInArticle] = useState(initialData.showInArticle !== false);

  useEffect(() => {
    onUpdate({
      platform,
      url,
      title: title || `Support me on ${SUPPORT_PLATFORMS[platform].name}`,
      description,
      showInArticle
    });
  }, [platform, url, title, description, showInArticle, onUpdate]);

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
    if (!title) {
      setTitle(`Support me on ${SUPPORT_PLATFORMS[newPlatform].name}`);
    }
  };

  const getPlatformIcon = (platformKey) => {
    switch (platformKey) {
      case 'paypal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.634.634 0 0 1-.633.74h-4.025c-.524 0-.968.382-1.05.9l-1.12 7.106H10.99c-.524 0-.968.382-1.05.9l-.69 4.39h3.85c.524 0 .968-.382 1.05-.9l.69-4.39h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.236-1.52.068-2.62-.532-3.512z"/>
          </svg>
        );
      case 'kofi':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.033 11.316c.049 4.001 3.254 3.631 3.254 3.631s8.96-.182 11.775-.212c2.773-.029 5.001-1.351 5.312-2.498.311-1.147.869-8.442.869-8.442zM14.563 18.756c-1.492.156-7.124.207-7.124.207s-2.35.024-2.386-2.484c-.037-2.508.012-9.609.012-9.609s.018-.537.537-.537H18.08s1.678.062 2.262 2.1c.584 2.038-.307 9.284-.307 9.284s-.424 1.192-1.979 1.039z"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
    }
  };

  return (
    <div className="support-block">
      <div className="support-block-header">
        <h3>Support Block</h3>
        <div className="support-block-toggle">
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

      <div className="support-form">
        <div className="form-group">
          <label>Platform</label>
          <div className="platform-selector">
            {Object.entries(SUPPORT_PLATFORMS).map(([key, platform]) => (
              <button
                key={key}
                type="button"
                className={`platform-option ${platform === key ? 'active' : ''}`}
                onClick={() => handlePlatformChange(key)}
                style={{ '--platform-color': platform.color }}
              >
                <span className="platform-icon">{getPlatformIcon(key)}</span>
                <span className="platform-name">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="support-url">Support URL</label>
          <input
            id="support-url"
            type="url"
            placeholder="https://paypal.me/yourusername"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="support-title">Title (optional)</label>
          <input
            id="support-title"
            type="text"
            placeholder={`Support me on ${SUPPORT_PLATFORMS[platform].name}`}
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="support-description">Description (optional)</label>
          <textarea
            id="support-description"
            placeholder="Help me create more content like this!"
            className="form-input"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {showInArticle && url && (
        <div className="support-preview">
          <h4>Preview:</h4>
          <div className="support-card" style={{ '--platform-color': SUPPORT_PLATFORMS[platform].color }}>
            <div className="support-icon">
              {getPlatformIcon(platform)}
            </div>
            <div className="support-content">
              <h5>{title || `Support me on ${SUPPORT_PLATFORMS[platform].name}`}</h5>
              {description && <p>{description}</p>}
            </div>
            <div className="support-action">
              <span className="support-button">Support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportBlock;