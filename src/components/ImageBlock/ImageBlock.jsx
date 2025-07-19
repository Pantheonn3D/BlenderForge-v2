import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './ImageBlock.css';

const ImageBlock = ({ initialUrl, onUpload, onRemove }) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState(initialUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-img-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails') // We can reuse the thumbnails bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('thumbnails').getPublicUrl(filePath);
      
      const newUrl = urlData.publicUrl;
      setImageUrl(newUrl);
      onUpload(newUrl); // Send the new URL back to the parent

    } catch (err) {
      setError('Image upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-block-container">
      {!imageUrl ? (
        <div className="image-block-placeholder">
          <label htmlFor={`image-upload-${Date.now()}`} className="image-upload-label">
            {isUploading ? 'Uploading...' : 'Click to Upload Image'}
          </label>
          <input
            id={`image-upload-${Date.now()}`}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="image-block-preview">
          <img src={imageUrl} alt="Article content" />
          <button onClick={onRemove} className="image-remove-button">×</button>
        </div>
      )}
      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
};

export default ImageBlock;