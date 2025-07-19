import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

// Import our icons
import ClockIcon from '../icons/ClockIcon';
import SignalIcon from '../icons/SignalIcon';
import CalendarIcon from '../icons/CalendarIcon';

// Helper function to format the date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ArticleCard = ({ article }) => {
  // If no article is passed, don't render anything to prevent errors
  if (!article) return null;

  // UNPACK the article object here. This is the new standard.
  const { slug, image_url, title, description, read_time, difficulty, created_at, category } = article;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#a0a0a0';
    }
  };

  return (
    <article className="article-card">
      <Link to={slug || '#'} className="article-card-link">
        <div className="article-card-image-container">
          <img 
            // THE FIX: Use image_url directly from the article object
            src={imageError ? 'https://placehold.co/600x400/1e1e1e/a0a0a0?text=Image+Not+Found' : image_url} 
            alt={title} 
            className={`article-card-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageError(true); setImageLoaded(true); }}
          />
          {!imageLoaded && (
            <div className="image-placeholder"><div className="image-loader"></div></div>
          )}
          <div className="image-overlay">
            <div className="overlay-content">
              <span className="read-more-text">Read Article</span>
              <svg className="read-more-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
          {category && (<div className="category-badge">{category}</div>)}
        </div>

        <div className="article-card-content">
          <div className="article-card-meta">
            <div className="meta-item"><ClockIcon className="meta-icon" /><span>{read_time}</span></div>
            <div className="meta-item difficulty-item">
              <SignalIcon className="meta-icon difficulty-icon" style={{ color: getDifficultyColor(difficulty) }}/>
              <span style={{ color: getDifficultyColor(difficulty) }}>{difficulty}</span>
            </div>
            <div className="meta-item"><CalendarIcon className="meta-icon" /><span>{formatDate(created_at)}</span></div>
          </div>
          <h3 className="article-title">{title}</h3>
          <p className="article-description">{description}</p>
          <div className="article-card-footer">
            <span className="article-card-link-text">
              Read More
              <svg className="link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard;