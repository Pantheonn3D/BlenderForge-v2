import React, { useState, useEffect } from 'react';
import './CustomLinkBlock.css';

const CustomLinkBlock = ({ initialData, onUpdate, onRemove }) => {
  const [url, setUrl] = useState(initialData.url || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || 'Visit Link');
  const [openInNewTab, setOpenInNewTab] = useState(initialData.openInNewTab !== false);
  const [showInArticle, setShowInArticle] = useState(initialData.showInArticle !== false);

  useEffect(() => {
    onUpdate({
      url,
      title,
      description,
      buttonText,
      openInNewTab,
      showInArticle
    });
  }, [url, title, description, buttonText, openInNewTab, showInArticle, onUpdate]);

  return (
    <div className="custom-link-block">
      <div className="custom-link-block-header">
        <h3>Custom Link Block</h3>
        <div className="custom-link-block-toggle">
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

      <div className="custom-link-form">
        <div className="form-group">
          <label htmlFor="custom-link-url">URL</label>
          <input
            id="custom-link-url"
            type="url"
            placeholder="https://example.com"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-link-title">Title</label>
          <input
            id="custom-link-title"
            type="text"
            placeholder="Link Title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-link-description">Description (optional)</label>
          <textarea
            id="custom-link-description"
            placeholder="Brief description of what this link leads to"
            className="form-input"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="custom-link-button-text">Button Text</label>
            <input
              id="custom-link-button-text"
              type="text"
              placeholder="Visit Link"
              className="form-input"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
              />
              Open in new tab
            </label>
          </div>
        </div>
      </div>

      {showInArticle && url && title && (
        <div className="custom-link-preview">
          <h4>Preview:</h4>
          <div className="custom-link-card">
            <div className="custom-link-content">
              <h5>{title}</h5>
              {description && <p>{description}</p>}
            </div>
            <div className="custom-link-action">
              <span className="custom-link-button">{buttonText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomLinkBlock;