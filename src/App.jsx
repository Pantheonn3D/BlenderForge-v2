import React, { Suspense, useEffect } from 'react';
// Import 'Link' from react-router-dom and 'useAuth' from your context
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // <<< 1. THIS IMPORT IS ADDED/CONFIRMED
import './App.css';
import { AuthProvider } from './context/AuthContext';

// Import All Components
import SupportBanner from './components/SupportBanner/SupportBanner';
import SupportPage from './components/SupportPage';
import Header from './components/Header/Header.jsx';
import ArticlesSection from './components/ArticlesSection/ArticlesSection.jsx';
import ArticleCreator from './components/ArticleCreator/ArticleCreator.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignUpPage from './components/SignUpPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ArticlePage from './components/ArticlePage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import KnowledgeBase from './components/KnowledgeBase.jsx';
import ForgeSupportersPage from './components/ForgeSupportersPage.jsx';
import PublicProfilePage from './components/PublicProfilePage';

// Loading Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading...</p>
  </div>
);

// Enhanced Homepage Component
const HomePage = () => {
  // <<< 2. THE HOOK IS PLACED HERE, INSIDE THE COMPONENT THAT USES IT
  const { user } = useAuth(); 

  useEffect(() => {
    document.title = 'The Ultimate Blender Hub - Assets, Art & Tutorials';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Your universe for Blender assets, art, and tutorials. Find what you need to create amazing 3D content.');
    }
  }, []);

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-title-accent"> The Ultimate </span>
             Blender Hub
          </h1>
          <p className="hero-description">
            Welcome to BlenderForge, your centralized place for assets, art, and tutorials. Find what you need to create 
            stunning 3D content and join a community of passionate creators.
          </p>
          <div className="hero-actions">
            <Link to="/knowledge-base?category=Tutorial" className="hero-btn primary">
              <span>Explore Tutorials</span>
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </Link>
            {/* This link will now work correctly */}
            <Link 
              to={user ? '/create' : '/login'} 
              className="hero-btn secondary"
            >
              <span>Create Article</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="hero-background">
          <div className="hero-grid"></div>
          <div className="hero-gradient"></div>
        </div>
      </section>
      <section id="articles-section" className="articles-section">
        <ArticlesSection />
      </section>
    </div>
  );
};

// Page Transition Component
const PageTransition = ({ children }) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-fallback">
    <div className="error-content">
      <div className="error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>We're sorry, but something unexpected happened.</p>
      <div className="error-actions">
        <button onClick={resetErrorBoundary} className="form-button-primary">
          Try Again
        </button>
        <button onClick={() => window.location.href = '/'} className="form-button-secondary">
          Go Home
        </button>
      </div>
      <details className="error-details">
        <summary>Error Details</summary>
        <pre>{error.message}</pre>
      </details>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error:', event.error);
    };
    window.addEventListener('error', handleError);
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <div className="app">
         <SupportBanner /> 
          <Header />
          <main className="main-content">
            <Suspense fallback={<LoadingSpinner />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/guides/:slug" element={<ArticlePage />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route 
                    path="/create" 
                    element={
                      <ProtectedRoute>
                        <ArticleCreator />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={
                    <div className="not-found-page">
                      <div className="not-found-content">
                        <h1>404</h1>
                        <h2>Page Not Found... yet</h2>
                        <p>The page you're looking for doesn't exist... but it's being worked on :)</p>
                        <button onClick={() => window.history.back()} className="form-button-primary">
                          Go Back
                        </button>
                      </div>
                    </div>
                  } />
                   <Route path="/support" element={<SupportPage />} /> {/* ADD THIS ROUTE */}
                  <Route path="/supporters" element={<ForgeSupportersPage />} />
                  <Route path="/profile/:userId" element={<PublicProfilePage />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </main>
          <footer className="app-footer">
            <div className="footer-content">
              <p>© 2025 BlenderForge. Please contact me at pantheon3d.contact@gmail.com</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;