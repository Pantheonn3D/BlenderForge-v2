import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Add Link here
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './ArticlePage.css';
import ConfirmationModal from './ConfirmationModal';
import SuccessPopup from './SuccessPopup';
import SupportForm from '../components/Support/PlatformSupportForm';

const ArticlePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*, profiles ( username, avatar_url )')
          .eq('slug', `/guides/${slug}`)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        setError('Article not found.');
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // --- EVENT HANDLERS ---
  const handleDelete = async () => {
    if (!article) return;
    setShowDeleteModal(false);

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      setSuccessMessage('Article deleted successfully. Redirecting...');
      setShowSuccess(true);
      
      setTimeout(() => navigate('/'), 2500);

    } catch (err) {
      setError('Error deleting article: ' + err.message);
      console.error("Error deleting article:", err);
    }
  };

  

  // --- RENDER HELPERS ---
  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <div 
            key={block.id || index} 
            className="article-content-block text-block"
            dangerouslySetInnerHTML={{ __html: block.content }} 
          />
        );
      case 'image':
        if (!block.content) return null;
        return (
          <figure key={block.id || index} className="article-content-block image-block">
            <img src={block.content} alt="Article content" loading="lazy" />
          </figure>
        );
      case 'support':
        if (!block.content.showInArticle || !block.content.url) return null;
        return (
          <div key={block.id || index} className="article-content-block support-block-display">
            <div className="support-card" style={{ '--platform-color': getSupportColor(block.content.platform) }}>
              <div className="support-icon">
                {getSupportIcon(block.content.platform)}
              </div>
              <div className="support-content">
                <h5>{block.content.title}</h5>
                {block.content.description && <p>{block.content.description}</p>}
              </div>
              <a 
                href={block.content.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="support-button"
              >
                Support
              </a>
            </div>
          </div>
        );
      case 'social':
        if (!block.content.showInArticle || !block.content.socialLinks?.length) return null;
        return (
          <div key={block.id || index} className="article-content-block social-block-display">
            <div className="social-card">
              <h5>{block.content.title}</h5>
              <div className="social-links">
                {block.content.socialLinks.filter(link => link.url).map((link, linkIndex) => (
                  <a 
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--platform-color': getSocialColor(link.platform) }}
                  >
                    <span className="social-icon">{getSocialIcon(link.platform)}</span>
                    <span className="social-name">{getSocialName(link.platform)}</span>
                    {link.username && <span className="social-username">@{link.username}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      case 'custom-link':
        if (!block.content.showInArticle || !block.content.url || !block.content.title) return null;
        return (
          <div key={block.id || index} className="article-content-block custom-link-block-display">
            <div className="custom-link-card">
              <div className="custom-link-content">
                <h5>{block.content.title}</h5>
                {block.content.description && <p>{block.content.description}</p>}
              </div>
              <a 
                href={block.content.url} 
                target={block.content.openInNewTab ? "_blank" : "_self"}
                rel={block.content.openInNewTab ? "noopener noreferrer" : ""}
                className="custom-link-button"
              >
                {block.content.buttonText}
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper functions for icons and colors
  const getSupportIcon = (platform) => {
    switch (platform) {
      case 'paypal':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.634.634 0 0 1-.633.74h-4.025c-.524 0-.968.382-1.05.9l-1.12 7.106H10.99c-.524 0-.968.382-1.05.9l-.69 4.39h3.85c.524 0 .968-.382 1.05-.9l.69-4.39h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.236-1.52.068-2.62-.532-3.512z"/>
          </svg>
        );
      case 'kofi':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.033 11.316c.049 4.001 3.254 3.631 3.254 3.631s8.96-.182 11.775-.212c2.773-.029 5.001-1.351 5.312-2.498.311-1.147.869-8.442.869-8.442zM14.563 18.756c-1.492.156-7.124.207-7.124.207s-2.35.024-2.386-2.484c-.037-2.508.012-9.609.012-9.609s.018-.537.537-.537H18.08s1.678.062 2.262 2.1c.584 2.038-.307 9.284-.307 9.284s-.424 1.192-1.979 1.039z"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
    }
  };

  const getSupportColor = (platform) => {
    const colors = {
      paypal: '#0070ba',
      kofi: '#ff5722',
      buymeacoffee: '#ffdd00',
      patreon: '#ff424d',
      gofundme: '#00b964',
      venmo: '#3d95ce',
      cashapp: '#00d632',
      custom: '#6c757d'
    };
    return colors[platform] || '#6c757d';
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'github':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 2H7C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4z"/>
            <path d="M9 17H7v-7h2v7zm-1-7.9c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zm8 7.9h-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-2v-7h2v1.2c.5-.8 1.6-1.2 2.5-1.2 1.9 0 3.5 1.6 3.5 3.5v3.5z"/>
          </svg>
        );
    }
  };

  const getSocialColor = (platform) => {
    const colors = {
      twitter: '#1da1f2',
      instagram: '#e4405f',
      youtube: '#ff0000',
      tiktok: '#000000',
      linkedin: '#0077b5',
      facebook: '#1877f2',
      discord: '#7289da',
      twitch: '#9146ff',
      github: '#181717',
      behance: '#1769ff',
      dribbble: '#ea4c89',
      artstation: '#13aff0'
    };
    return colors[platform] || '#6c757d';
  };

  const getSocialName = (platform) => {
    const names = {
      twitter: 'Twitter',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      discord: 'Discord',
      twitch: 'Twitch',
      github: 'GitHub',
      behance: 'Behance',
      dribbble: 'Dribbble',
      artstation: 'ArtStation'
    };
    return names[platform] || platform;
  };

  // --- LOADING AND ERROR STATES ---
  if (loading) {
    return (
      <div className="article-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Article...</p>
        </div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="article-page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2>Article Not Found</h2>
          <p>{error || "The requested article could not be found."}</p>
          <button onClick={() => navigate('/')} className="form-button-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Parse article content
  let blocks = [];
  try {
    if (article.content) {
      blocks = JSON.parse(article.content);
    }
  } catch (e) {
    console.error("Failed to parse article content:", e);
    return (
      <div className="article-page-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2>Content Error</h2>
          <p>Failed to load article content.</p>
          <button onClick={() => navigate('/')} className="form-button-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.id === article.user_id;

  return (
    <>
      <ConfirmationModal
        isVisible={showDeleteModal}
        title="Delete Article"
        message="Are you sure you want to permanently delete this article? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Yes, Delete"
      />
      <SuccessPopup
        isVisible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      <div className="article-page-container">
        <article className="article-content">
          <header className="article-header">
            <div className="article-meta">
              <div className="category-badge">{article.category}</div>
              <div className={`difficulty-badge difficulty-${article.difficulty?.toLowerCase()}`}>{article.difficulty}</div>
              <div className="read-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                {article.read_time}
              </div>
            </div>
            
            <h1 className="article-title">{article.title}</h1>
            <p className="article-description">{article.description}</p>
            
            <div className="author-info">
              <img 
                src={article.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${article.user_id}`} 
                alt={article.profiles?.username} 
                className="author-avatar"
              />
              <div className="author-details">
                {/* The span is now a Link pointing to the user's profile URL */}
                <Link to={`/profile/${article.user_id}`} className="author-name-link">
                  By {article.profiles?.username || 'Anonymous'}
                </Link>

                {/* This part remains exactly the same */}
                <span className="publish-date">{new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </header>

          <div className="article-hero">
            <img src={article.image_url} alt={article.title} className="hero-image"/>
          </div>
          
      <div className="article-body">
        {blocks.length > 0 ? (
          blocks.map((block, index) => renderBlock(block, index))
        ) : (
          <div className="empty-content">
            <p>This article doesn't have any content yet.</p>
          </div>
        )}
      </div>

      {/* --- SUPPORT THE PLATFORM SECTION --- */}
      {user && (
        <section className="support-platform-section">
          <h2 className="support-section-title">Enjoying the Content?</h2>
          <p className="support-section-subtitle">Support BlenderForge with a $5 monthly donation to help us keep the platform running and ad-free. Get on the <Link to="/supporters" className="support-link">Supporters Page </Link></p>
          <SupportForm />
        </section>
      )}
  

      {isAuthor && (
        <footer className="article-footer">
              <div className="author-actions">
                <button 
                  onClick={() => setShowDeleteModal(true)} 
                  className="form-button-secondary form-button-danger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Delete Article
                </button>
              </div>
            </footer>
          )}
        </article>
      </div>
    </>
  );
};

export default ArticlePage;