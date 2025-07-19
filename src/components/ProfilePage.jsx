import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import SuccessPopup from './SuccessPopup'; // 1. Import the new component

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // 2. Add state to control the success popup
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- DATA FETCHING ---
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish

    if (!user) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
          throw error;
        }
        
        if (data) {
          setProfile(data);
          setUsername(data.username || '');
          setAvatarPreview(data.avatar_url || '');
        }
      } catch (error) {
        setError('Failed to load profile: ' + error.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  // --- EVENT HANDLERS ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      let avatarUrl = profile?.avatar_url;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true }); // Use upsert to overwrite if needed

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }

      const updateData = {
        id: user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(updateData);
      if (error) throw error;

      setProfile(updateData);
      setAvatarFile(null);
      
      // 3. Trigger the success popup instead of a generic alert
      setSuccessMessage('Your profile has been updated successfully!');
      setShowSuccess(true);

    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
    }
  };

  // --- RENDER LOGIC ---
  if (authLoading || profileLoading) {
    return (
      <div className="loading-container">
        <p>Loading Your Profile...</p>
      </div>
    );
  }

  return (
    // 4. Wrap the page content in a Fragment and render the popup
    <>
      <SuccessPopup
        isVisible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      <div className="profile-page-container">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleUpdateProfile}>
          <div className="profile-header">
            <div className="profile-avatar-container">
              <img 
                src={avatarPreview || `https://i.pravatar.cc/150?u=${user.id}`} 
                alt="Profile Avatar" 
                className="profile-avatar"
              />
              <label htmlFor="avatar-upload" className="avatar-edit-button" title="Change Avatar">
                +
              </label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-header-info">
              <h1>{username || 'New User'}</h1>
              <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-form">
              <h2>Account Settings</h2>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  id="username"
                  type="text"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={50}
                  placeholder="Enter your username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email"
                  className="auth-input"
                  value={user.email}
                  disabled
                />
              </div>
              <button 
                type="submit" 
                className="auth-button"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="logout-section">
              <h2>Log Out</h2>
              <p>This will log you out of your account on this device.</p>
              <button 
                type="button"
                onClick={handleLogout} 
                className="auth-button logout"
              >
                Log Out
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;