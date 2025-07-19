import React, { useState, useEffect } from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';
import ArticleCard from '../ArticleCard/ArticleCard';
import './ArticlesSection.css';

// Import the Supabase client
import { supabase } from '../../supabaseClient';

// Helper function to format the date in a readable way
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const ArticlesSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        // Fetch the 3 most recent articles and their author's profile info in one query
        const { data, error } = await supabase
          .from('articles')
          .select('*, profiles ( username, avatar_url )') // This joins the profiles table
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        setArticles(data);

      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []); // The empty array ensures this effect runs only once

  // --- Render logic to handle loading, error, and success states ---
  const renderContent = () => {
    if (loading) {
      return <p className="loading-text">Loading articles...</p>;
    }

    if (error) {
      return <p className="error-text">Failed to load articles. Please try again later.</p>;
    }

    if (!articles || articles.length === 0) {
      return <p className="loading-text">No articles have been published yet.</p>;
    }

    return (
      <div className="articles-grid">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article} // Pass the entire article object
        />
      ))}
      </div>
    );
  };

  return (
    <section className="articles-section">
      <SectionHeader title="Latest Articles" buttonText="View All Articles" buttonLink="/knowledge-base" />
      <div className="articles-content">
        {renderContent()}
      </div>
    </section>
  );
};

export default ArticlesSection;