import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ArticleCard from './ArticleCard/ArticleCard';
import './KnowledgeBase.css';

// Reusable Icon component
const Icon = ({ path, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    {path}
  </svg>
);

// Centralized SVG icons
const ICONS = {
  ACADEMIC_CAP: <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />,
  COG: <><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></>,
  BOOK_OPEN: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />,
  NEWSPAPER: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />,
  SEARCH: <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
  FILTER: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />,
  X_MARK: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
};

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

const KnowledgeBase = () => {
  // --- STATE MANAGEMENT ---
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Separate internal search state from URL params to prevent reloads
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchParams.get('q') || '');
  
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedDifficulty = searchParams.get('difficulty') || 'all';
  const sortBy = searchParams.get('sort') || 'newest';
  
  // Debounce the search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(internalSearchQuery, 300);
  
  // --- CONFIGURATION ---
  const categories = [
    { 
      id: 'all', 
      name: 'All Articles', 
      icon: ICONS.ACADEMIC_CAP, 
      description: 'Browse all content',
      color: '#f3ce02'
    },
    { 
      id: 'Tutorial', 
      name: 'Tutorials', 
      icon: ICONS.ACADEMIC_CAP, 
      description: 'Step-by-step learning guides',
      color: '#4caf50'
    },
    { 
      id: 'Workflow', 
      name: 'Workflows', 
      icon: ICONS.COG, 
      description: 'Process optimization guides',
      color: '#2196f3'
    },
    { 
      id: 'Guide', 
      name: 'Guides', 
      icon: ICONS.BOOK_OPEN, 
      description: 'Comprehensive how-to content',
      color: '#ff9800'
    },
    { 
      id: 'News', 
      name: 'News', 
      icon: ICONS.NEWSPAPER, 
      description: 'Latest updates and announcements',
      color: '#e91e63'
    }
  ];
  
  const difficulties = [
    { id: 'all', name: 'All Levels', color: '#a0a0a0' },
    { id: 'Beginner', name: 'Beginner', color: '#4caf50' },
    { id: 'Intermediate', name: 'Intermediate', color: '#ff9800' },
    { id: 'Advanced', name: 'Advanced', color: '#f44336' }
  ];
  
  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'title', name: 'Title (A-Z)' },
    { id: 'difficulty', name: 'By Difficulty' }
  ];

  // --- DATA FETCHING ---
  const fetchArticles = useCallback(async () => {
    try {
      setSearchLoading(true);
      
      let query = supabase
        .from('articles')
        .select(`*, profiles(username, avatar_url)`);
      
      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty);
      }
      
      if (debouncedSearchQuery) {
        query = query.or(`title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
      }
      
      // Apply sorting
      if (sortBy !== 'difficulty') {
        const sortOptions = {
          'newest': { ascending: false, column: 'created_at' },
          'oldest': { ascending: true, column: 'created_at' },
          'title': { ascending: true, column: 'title' }
        };
        
        if (sortOptions[sortBy]) {
          query = query.order(sortOptions[sortBy].column, { ascending: sortOptions[sortBy].ascending });
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let finalData = data || [];
      
      // Handle difficulty sorting
      if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        finalData.sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0));
      }
      
      setArticles(finalData);
      setError(null);
      
    } catch (err) {
      setError('Failed to load articles. Please try again.');
      console.error('Error fetching articles:', err);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  }, [debouncedSearchQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Fetch articles when filters change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Update URL when search query changes (debounced)
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (debouncedSearchQuery) {
      newSearchParams.set('q', debouncedSearchQuery);
    } else {
      newSearchParams.delete('q');
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [debouncedSearchQuery, searchParams, setSearchParams]);

  // --- COMPUTED VALUES ---
  const groupedArticles = useMemo(() => {
    if (selectedCategory !== 'all' || debouncedSearchQuery) return {};
    
    const grouped = {};
    categories.slice(1).forEach(category => {
      grouped[category.id] = articles.filter(article => article.category === category.id);
    });
    
    return grouped;
  }, [articles, selectedCategory, debouncedSearchQuery, categories]);

  const shouldShowFilters = selectedCategory !== 'all' || debouncedSearchQuery;
  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || sortBy !== 'newest' || debouncedSearchQuery;

  // --- EVENT HANDLERS ---
  const handleSearchChange = (e) => {
    setInternalSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (!value || value === 'all' || value === 'newest') {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, value);
    }
    
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleCategoryClick = (categoryId) => {
    const newSearchParams = new URLSearchParams();
    
    if (categoryId === 'all') {
      // Clear all filters when going to "All"
      setInternalSearchQuery('');
    } else {
      newSearchParams.set('category', categoryId);
    }
    
    setSearchParams(newSearchParams, { replace: true });
  };

  const clearAllFilters = () => {
    setInternalSearchQuery('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const clearSearch = () => {
    setInternalSearchQuery('');
  };

  // --- COMPONENTS ---
  const CategorySection = ({ category, articles: catArticles }) => (
    <div className="category-section">
      <div className="category-header">
        <div className="category-icon" style={{ backgroundColor: category.color + '20', color: category.color }}>
          <Icon path={category.icon} className="category-header-icon" />
        </div>
        <div className="category-info">
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
        <div className="category-stats">
          <span className="category-count">{catArticles.length}</span>
          <span className="category-label">article{catArticles.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      {catArticles.length > 0 ? (
        <>
          <div className="articles-grid">
            {catArticles.slice(0, 3).map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          
          {catArticles.length > 3 && (
            <div className="view-all-button">
              <button 
                onClick={() => handleCategoryClick(category.id)} 
                className="form-button-secondary"
              >
                View All {category.name} ({catArticles.length})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-category">
          <div className="empty-icon">
            <Icon path={category.icon} />
          </div>
          <p>No {category.name.toLowerCase()} available yet.</p>
        </div>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading articles...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button onClick={fetchArticles} className="form-button-primary">
        Try Again
      </button>
    </div>
  );

  // --- RENDER ---
  if (loading && articles.length === 0) {
    return (
      <div className="knowledge-base-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="knowledge-base-container">
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="knowledge-base-container">
      {/* Header Section */}
      <div className="knowledge-base-header">
        <div className="header-content">
          <h1>Knowledge Base</h1>
          <p>Discover tutorials, workflows, guides, and the latest news</p>
        </div>
        
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-container">
              <Icon path={ICONS.SEARCH} className="search-icon" />
              <input
                type="text"
                placeholder="Search articles, tutorials, guides..."
                value={internalSearchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {internalSearchQuery && (
                <button 
                  onClick={clearSearch} 
                  className="clear-search"
                  title="Clear search"
                >
                  <Icon path={ICONS.X_MARK} />
                </button>
              )}
            </div>
          </div>
          
        {/* Category Navigation */}
          <div className="category-nav">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`category-nav-item ${selectedCategory === category.id ? 'active' : ''}`}
                style={{ '--category-color': category.color }}
              >
                <div className="category-nav-icon">
                  <Icon path={category.icon} />
                </div>
                <span className="category-nav-name">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          {shouldShowFilters && (
            <div className="filters-container">
              <div className="filters-header">
                <div className="filter-icon-wrapper">
                  <Icon path={ICONS.FILTER} className="filter-icon" />
                  <span className="filter-label">Filter by:</span>
                </div>
              </div>
              
              <div className="filters-controls">
                <div className="filter-section">
                  <div className="filter-section-header">
                    <span className="filter-section-label">DIFFICULTY</span>
                  </div>
                  <div className="select-wrapper">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="form-input"
                    >
                      {difficulties.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>
                
                <div className="filter-section">
                  <div className="filter-section-header">
                    <span className="filter-section-label">SORT BY</span>
                  </div>
                  <div className="select-wrapper">
                    <select
                      value={sortBy}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="form-input"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="clear-filters-section">
                    <button 
                      onClick={clearAllFilters} 
                      className="clear-filters-btn"
                      title="Clear all filters"
                    >
                      <Icon path={ICONS.X_MARK} />
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!shouldShowFilters ? (
          // Show all categories
          <div className="all-categories-view">
            {categories.slice(1).map(category => (
              <CategorySection 
                key={category.id} 
                category={category} 
                articles={groupedArticles[category.id] || []}
              />
            ))}
          </div>
        ) : (
          // Show filtered results
          <div className="filtered-articles-view">
            <div className="results-header">
              <div className="results-info">
                <h2>
                  {debouncedSearchQuery 
                    ? `Search Results for "${debouncedSearchQuery}"` 
                    : categories.find(c => c.id === selectedCategory)?.name
                  }
                </h2>
                <div className="results-meta">
                  <span className="results-count">
                    {articles.length} article{articles.length !== 1 ? 's' : ''}
                  </span>
                  {searchLoading && (
                    <div className="search-loading">
                      <div className="search-spinner"></div>
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {articles.length > 0 ? (
              <div className="articles-grid">
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : !searchLoading ? (
              <div className="no-results">
                <div className="no-results-icon">
                  <Icon path={ICONS.SEARCH} />
                </div>
                <h3>No articles found</h3>
                <p>
                  {debouncedSearchQuery 
                    ? `No articles match your search for "${debouncedSearchQuery}"`
                    : "No articles match your current filters"
                  }
                </p>
                <button onClick={clearAllFilters} className="form-button-primary">
                  Clear All Filters
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;