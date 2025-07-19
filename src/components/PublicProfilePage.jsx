// src/components/PublicProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// --- 1. IMPORT YOUR EXISTING ARTICLE CARD COMPONENT ---
import ArticleCard from './ArticleCard/ArticleCard'; // Make sure this path is correct

import './PublicProfilePage.css';

const PublicProfilePage = () => {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfileData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        // We no longer need to check supporter status for the star, so the query is simpler
        const [profileResult, articlesResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('articles').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        ]);

        if (profileResult.error) {
          throw new Error("This user does not exist.");
        }
        
        setProfile(profileResult.data);
        setArticles(articlesResult.data || []);

      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfileData();
  }, [userId]);

  if (loading) {
    return <div className="loading-container"><p>Loading Profile...</p></div>;
  }

  if (error) {
    return <div className="error-container"><h2>Profile Not Found</h2><p>{error}</p></div>;
  }

  return (
    <div className="public-profile-page">
      <header className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`} 
            alt={`${profile.username}'s Avatar`} 
            className="profile-avatar"
          />
          {/* --- 2. THE SUPPORTER STAR BADGE HAS BEEN REMOVED --- */}
        </div>
        <div className="profile-header-info">
          <h1>{profile.username}</h1>
          <p>Joined: {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      <main className="profile-main-content">
        <div className="user-articles">
          <h2>Published Articles</h2>
          {articles.length > 0 ? (
            <div className="article-list">
              {/* --- 3. RENDER THE ARTICLECARD COMPONENT --- */}
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <p>This user hasn't published any articles yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfilePage;