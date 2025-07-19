import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ForgeSupportersPage.css';

const ForgeSupportersPage = () => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('supporters')
          .select(`
            created_at, 
            social_media_link, 
            profiles ( 
              id, 
              username, 
              avatar_url 
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSupporters(data || []);
      } catch (err) {
        console.error('Error fetching supporters:', err);
        setError('Could not load the list of supporters.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupporters();
  }, []);

  // Filter and sort supporters
  const filteredAndSortedSupporters = useMemo(() => {
    let filtered = supporters;
    
    // Apply search filter
    if (searchTerm) {
      filtered = supporters.filter(supporter =>
        supporter.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'alphabetical') {
        return (a.profiles?.username || '').localeCompare(b.profiles?.username || '');
      }
      return 0;
    });
    
    return sorted;
  }, [supporters, searchTerm, sortBy]);

  const handleCardClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getSupportDuration = (createdAt) => {
    const start = new Date(createdAt);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + 
                   (now.getMonth() - start.getMonth());
    
    if (months < 1) return 'New Supporter';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year' : `${years} years`;
  };

  const getSupporterTier = (createdAt) => {
    const months = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24 * 30));
    
    if (months >= 24) return { name: 'Legendary', color: '#ff6b6b' };
    if (months >= 12) return { name: 'Elite', color: '#f3ce02' };
    if (months >= 6) return { name: 'Veteran', color: '#4ecdc4' };
    if (months >= 3) return { name: 'Dedicated', color: '#95a5a6' };
    return { name: 'New', color: '#3498db' };
  };

  if (loading) {
    return (
      <div className="supporters-page-container">
        <header className="supporters-header">
          <h1 className="supporters-title">
            <span className="title-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </span>
            Forge Supporters
          </h1>
          <div className="skeleton-text skeleton-subtitle"></div>
        </header>
        <div className="supporters-grid loading-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="supporter-card-skeleton">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text skeleton-name"></div>
              <div className="skeleton-text skeleton-date"></div>
              <div className="skeleton-button"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supporters-page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2>Unable to Load Supporters</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supporters-page-container">
      <header className="supporters-header">
        <h1 className="supporters-title">
          <span className="title-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
          Forge Supporters
        </h1>
        <p className="supporters-subtitle">
          A huge thank you to the Forge Supporters who help keep the platform running and growing. 
          You are the foundation of this community.
        </p>
        <Link to="/support" className="cta-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Become a Forge Supporter
        </Link>
      </header>

      {supporters.length > 0 && (
        <div className="supporters-controls">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search supporters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-container">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {filteredAndSortedSupporters.length > 0 ? (
        <div className="supporters-grid">
          {filteredAndSortedSupporters.map((supporter, index) => {
            const tier = getSupporterTier(supporter.created_at);
            return (
              <article
                key={supporter.profiles?.id || index}
                className="supporter-card"
                onClick={() => handleCardClick(supporter.profiles?.id)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(supporter.profiles?.id);
                  }
                }}
                style={{ animationDelay: `${index * 0.05}s` }}
                aria-label={`View ${supporter.profiles?.username}'s profile`}
              >
                <div className="supporter-tier-badge" style={{ backgroundColor: tier.color }}>
                  {tier.name}
                </div>
                
                <div className="supporter-avatar-container">
                  <img 
                    src={supporter.profiles?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${supporter.profiles?.username}`} 
                    alt={`${supporter.profiles?.username}'s avatar`}
                    className="supporter-avatar"
                    loading="lazy"
                  />
                  <div className="avatar-ring" style={{ borderColor: tier.color }}></div>
                </div>
                
                <h3 className="supporter-name">{supporter.profiles?.username || 'Anonymous'}</h3>
                
                <div className="supporter-info">
                  <p className="supporter-duration">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {getSupportDuration(supporter.created_at)}
                  </p>
                  <p className="supporter-since">
                    Since {new Date(supporter.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                {supporter.social_media_link && (
                  <a 
                    href={supporter.social_media_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-button"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`View ${supporter.profiles?.username}'s social profile`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Social Profile
                  </a>
                )}
              </article>
            );
          })}
        </div>
      ) : searchTerm ? (
        <div className="no-results-container">
          <div className="no-results-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <p className="no-results-message">No supporters found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="clear-search-button">
            Clear Search
          </button>
        </div>
      ) : (
        <div className="empty-state-container">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2>Be the First Forge Supporter!</h2>
          <p>Help us build an amazing community for Blender artists.</p>
          <Link to="/support" className="cta-button">
            Start Supporting
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgeSupportersPage;