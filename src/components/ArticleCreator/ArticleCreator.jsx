import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import './ArticleCreator.css';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import SuccessPopup from '../SuccessPopup';
import ImageBlock from '../ImageBlock/ImageBlock';
import SupportBlock from '../SupportBlock/SupportBlock';
import SocialBlock from '../SocialBlock/SocialBlock';
import CustomLinkBlock from '../CustomLinkBlock/CustomLinkBlock';

// Constants
const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 160;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_READ_TIME = 1;
const MAX_READ_TIME = 120;
const STORAGE_KEY = 'article_creator_draft';

// Quill configuration
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

const ArticleCreator = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const quillRefs = useRef({});
  const saveTimeoutRef = useRef(null);

  // State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tutorial',
    difficulty: 'Beginner',
    readTime: '',
    thumbnailFile: null,
    thumbnailPreview: ''
  });

  const [blocks, setBlocks] = useState([
    { id: `block_${Date.now()}`, type: 'text', content: '' }
  ]);

  const [dragState, setDragState] = useState({
    draggedBlock: null,
    dragOverIndex: null,
    isDragging: false,
    dropPosition: null
  });

  const [uiState, setUiState] = useState({
    isUploading: false,
    showSuccess: false,
    successMessage: '',
    errors: {},
    touched: {},
    focusedBlock: null
  });

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const draftData = {
        formData: {
          ...formData,
          thumbnailFile: null // Don't save file object
        },
        blocks,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    }, 1000);
  }, [formData, blocks]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
          const { formData: savedFormData, blocks: savedBlocks, timestamp } = JSON.parse(savedDraft);
          
          // Only load if draft is less than 7 days old
          const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (timestamp > weekAgo) {
            setFormData(prev => ({ ...prev, ...savedFormData }));
            if (savedBlocks && savedBlocks.length > 0) {
              setBlocks(savedBlocks);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  // Clear draft on successful publish
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, []);

  // Computed values
  const titleRemainingChars = TITLE_MAX_LENGTH - formData.title.length;
  const descRemainingChars = DESCRIPTION_MAX_LENGTH - formData.description.length;
  
  const hasContentBlocks = useMemo(() => {
    return blocks.some(block => {
      if (block.type === 'text') {
        const textContent = block.content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      }
      if (block.type === 'image') {
        return block.content && block.content.trim().length > 0;
      }
      // For complex block types (support, social, custom-link)
      if (typeof block.content === 'object') {
        return Object.keys(block.content).length > 0 &&
          Object.values(block.content).some(val => val && val.trim && val.trim().length > 0);
      }
      return false;
    });
  }, [blocks]);

  // Validation
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'title':
        if (!value?.trim()) return 'Title is required';
        if (value.length > TITLE_MAX_LENGTH) return `Title must be ${TITLE_MAX_LENGTH} characters or less`;
        return '';
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.length > DESCRIPTION_MAX_LENGTH) return `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less`;
        return '';
      case 'readTime':
        const numValue = parseInt(value);
        if (!value || isNaN(numValue)) return 'Read time is required';
        if (numValue < MIN_READ_TIME || numValue > MAX_READ_TIME) {
          return `Read time must be between ${MIN_READ_TIME} and ${MAX_READ_TIME} minutes`;
        }
        return '';
      case 'thumbnail':
        if (!formData.thumbnailFile) return 'Thumbnail is required';
        return '';
      default:
        return '';
    }
  }, [formData.thumbnailFile]);

  const validateForm = useCallback(() => {
    const newErrors = {
      title: validateField('title', formData.title),
      description: validateField('description', formData.description),
      readTime: validateField('readTime', formData.readTime),
      thumbnail: validateField('thumbnail')
    };

    if (!hasContentBlocks) {
      newErrors.content = 'Article must have at least one content block with content';
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value)
    );

    setUiState(prev => ({ ...prev, errors: filteredErrors }));
    return Object.keys(filteredErrors).length === 0;
  }, [formData, hasContentBlocks, validateField]);

  // Form handlers
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error and mark as touched
    if (uiState.errors[field]) {
      setUiState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
        touched: { ...prev.touched, [field]: true }
      }));
    }
  }, [uiState.errors]);

  const handleFieldBlur = useCallback((field, value) => {
    const error = validateField(field, value);
    setUiState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      touched: { ...prev.touched, [field]: true }
    }));
  }, [validateField]);

  // Thumbnail handlers
  const handleThumbnailChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setUiState(prev => ({
        ...prev,
        errors: { ...prev.errors, thumbnail: 'Please select a valid image file (JPEG, PNG, or WebP)' }
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUiState(prev => ({
        ...prev,
        errors: { ...prev.errors, thumbnail: 'File size must be less than 5MB' }
      }));
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      thumbnailFile: file,
      thumbnailPreview: preview
    }));

    setUiState(prev => ({
      ...prev,
      errors: { ...prev.errors, thumbnail: '' },
      touched: { ...prev.touched, thumbnail: true }
    }));
  }, []);

  const handleRemoveThumbnail = useCallback(() => {
    if (formData.thumbnailPreview) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }

    setFormData(prev => ({
      ...prev,
      thumbnailFile: null,
      thumbnailPreview: ''
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (uiState.touched.thumbnail) {
      setUiState(prev => ({
        ...prev,
        errors: { ...prev.errors, thumbnail: 'Thumbnail is required' }
      }));
    }
  }, [formData.thumbnailPreview, uiState.touched.thumbnail]);

  // Block management
  const generateBlockId = useCallback(() => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addBlock = useCallback((type, insertIndex = null) => {
    const newBlock = {
      id: generateBlockId(),
      type,
      content: type === 'support' || type === 'social' || type === 'custom-link' ? {} : ''
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      if (insertIndex !== null && insertIndex >= 0 && insertIndex <= prev.length) {
        newBlocks.splice(insertIndex, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      return newBlocks;
    });

    // Focus new text block
    if (type === 'text') {
      setTimeout(() => {
        const quillInstance = quillRefs.current[newBlock.id];
        if (quillInstance) {
          quillInstance.focus();
        }
      }, 100);
    }
  }, [generateBlockId]);

  const updateBlock = useCallback((id, newContent) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, content: newContent } : block
      )
    );

    // Clear content error if there's now content
    if (uiState.errors.content) {
      setTimeout(() => {
        if (hasContentBlocks) {
          setUiState(prev => ({
            ...prev,
            errors: { ...prev.errors, content: '' }
          }));
        }
      }, 100);
    }
  }, [uiState.errors.content, hasContentBlocks]);

  const removeBlock = useCallback((id) => {
    if (blocks.length <= 1) return;

    // Clean up quill ref
    delete quillRefs.current[id];

    setBlocks(prev => {
      const filtered = prev.filter(block => block.id !== id);
      return filtered.length > 0 ? filtered : [{ 
        id: generateBlockId(), 
        type: 'text', 
        content: '' 
      }];
    });
  }, [blocks.length, generateBlockId]);

  const duplicateBlock = useCallback((id) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (!blockToDuplicate) return;

    const blockIndex = blocks.findIndex(block => block.id === id);
    const newBlock = {
      ...blockToDuplicate,
      id: generateBlockId()
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      return newBlocks;
    });
  }, [blocks, generateBlockId]);

  // Fixed drag and drop handlers
  const handleDragStart = useCallback((e, blockId, index) => {
    const block = blocks.find(b => b.id === blockId);
    setDragState({
      draggedBlock: { block, index },
      dragOverIndex: null,
      isDragging: true,
      dropPosition: null
    });
    
    dragCounter.current = 0;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, [blocks]);

  const handleDragEnd = useCallback((e) => {
    setDragState({
      draggedBlock: null,
      dragOverIndex: null,
      isDragging: false,
      dropPosition: null
    });
    dragCounter.current = 0;
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragState.draggedBlock && dragState.draggedBlock.index !== index) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const position = e.clientY < midpoint ? 'before' : 'after';
      
      setDragState(prev => ({
        ...prev,
        dragOverIndex: index,
        dropPosition: position
      }));
    }
  }, [dragState.draggedBlock]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    dragCounter.current++;
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: null,
        dropPosition: null
      }));
    }
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (dragState.draggedBlock && dragState.draggedBlock.index !== dropIndex) {
      const newBlocks = [...blocks];
      const [draggedItem] = newBlocks.splice(dragState.draggedBlock.index, 1);
      
      let adjustedDropIndex = dropIndex;
      if (dragState.draggedBlock.index < dropIndex) {
        adjustedDropIndex = dropIndex - 1;
      }
      
      if (dragState.dropPosition === 'after') {
        adjustedDropIndex += 1;
      }
      
      newBlocks.splice(adjustedDropIndex, 0, draggedItem);
      setBlocks(newBlocks);
    }

    setDragState({
      draggedBlock: null,
      dragOverIndex: null,
      isDragging: false,
      dropPosition: null
    });
  }, [blocks, dragState]);

  // Fixed Quill editor handlers
  const handleQuillFocus = useCallback((blockId) => {
    setUiState(prev => ({ ...prev, focusedBlock: blockId }));
  }, []);

  const handleQuillBlur = useCallback(() => {
    // Don't immediately clear focus to allow for toolbar interactions
    setTimeout(() => {
      setUiState(prev => ({ ...prev, focusedBlock: null }));
    }, 200);
  }, []);

  // Fixed ref handling for ReactQuill
  const handleQuillRef = useCallback((blockId) => {
    return (quill) => {
      if (quill) {
        quillRefs.current[blockId] = quill;
      } else {
        delete quillRefs.current[blockId];
      }
    };
  }, []);

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!user) {
      setUiState(prev => ({
        ...prev,
        errors: { general: "You must be logged in to publish an article." }
      }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setUiState(prev => ({ ...prev, isUploading: true, errors: {} }));

    try {
      // Upload thumbnail
      const fileExt = formData.thumbnailFile.name.split('.').pop();
      const fileName = `${user.id}-thumb-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, formData.thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get thumbnail URL
      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      // Create unique slug
      const baseSlug = `/guides/${formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')}`;

      let finalSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', finalSlug)
          .single();

        if (!existingArticle) break;
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Insert article
      const { error: insertError } = await supabase
        .from('articles')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim(),
          image_url: urlData.publicUrl,
          category: formData.category,
          difficulty: formData.difficulty,
          read_time: `${formData.readTime} min read`,
          slug: finalSlug,
          content: JSON.stringify(blocks),
          user_id: user.id,
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      // Clear draft
      clearDraft();

      // Success
      setUiState(prev => ({
        ...prev,
        successMessage: 'Your article has been published successfully!',
        showSuccess: true
      }));

      setTimeout(() => navigate('/'), 2500);

    } catch (error) {
      console.error('Error publishing article:', error);
      
      let errorMessage = 'Failed to publish article. Please try again.';
      if (error.message?.includes('storage')) {
        errorMessage = 'Failed to upload thumbnail. Please try again.';
      }

      setUiState(prev => ({
        ...prev,
        errors: { general: errorMessage }
      }));
    } finally {
      setUiState(prev => ({ ...prev, isUploading: false }));
    }
  }, [user, formData, blocks, validateForm, navigate, clearDraft]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (formData.thumbnailPreview) {
        URL.revokeObjectURL(formData.thumbnailPreview);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData.thumbnailPreview]);

  // Block content renderer
  const renderBlockContent = useCallback((block) => {
    switch (block.type) {
      case 'text':
        return (
          <div className={`ac-editor-container ${uiState.focusedBlock === block.id ? 'focused' : ''}`}>
            <ReactQuill 
              ref={handleQuillRef(block.id)}
              theme="snow" 
              value={block.content} 
              onChange={(content) => updateBlock(block.id, content)} 
              onFocus={() => handleQuillFocus(block.id)}
              onBlur={handleQuillBlur}
              placeholder="Start writing your story..."
              modules={QUILL_MODULES}
            />
          </div>
        );
      case 'image':
        return (
          <ImageBlock 
            initialUrl={block.content} 
            onUpload={(url) => updateBlock(block.id, url)} 
            onRemove={() => removeBlock(block.id)} 
          />
        );
      case 'support':
        return (
          <SupportBlock 
            initialData={block.content} 
            onUpdate={(data) => updateBlock(block.id, data)} 
            onRemove={() => removeBlock(block.id)}
          />
        );
      case 'social':
        return (
          <SocialBlock 
            initialData={block.content} 
            onUpdate={(data) => updateBlock(block.id, data)} 
            onRemove={() => removeBlock(block.id)}
          />
        );
      case 'custom-link':
        return (
          <CustomLinkBlock 
            initialData={block.content} 
            onUpdate={(data) => updateBlock(block.id, data)} 
            onRemove={() => removeBlock(block.id)}
          />
        );
      default:
        return (
          <div className="ac-unsupported-block">
            Unsupported block type: {block.type}
          </div>
        );
    }
  }, [updateBlock, removeBlock, uiState.focusedBlock, handleQuillRef, handleQuillFocus, handleQuillBlur]);

  const getBlockIcon = (type) => {
    const iconProps = { width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 2 };
    
    switch (type) {
      case 'text':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <polyline points="4,7 4,4 20,4 20,7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        );
      case 'image':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        );
      case 'support':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'social':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        );
      case 'custom-link':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBlockTypeName = (type) => {
    switch (type) {
      case 'text': return 'Text';
      case 'image': return 'Image';
      case 'support': return 'Donation';
      case 'social': return 'Social Media';
      case 'custom-link': return 'Custom Link';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <>
      <SuccessPopup
        isVisible={uiState.showSuccess}
        message={uiState.successMessage}
        onClose={() => setUiState(prev => ({ ...prev, showSuccess: false }))}
      />
      
      <div className="ac-container">
        <div className="ac-header">
          <h1 className="ac-title">Create a New Article</h1>
          <p className="ac-subtitle">Share your knowledge with the community</p>
        </div>

        <div className="ac-content">
          {/* Error Banner */}
          {uiState.errors.general && (
            <div className="ac-error-banner" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {uiState.errors.general}
            </div>
          )}

          {/* Metadata Section */}
          <div className="ac-section">
            <h2 className="ac-section-title">Article Details</h2>
            
            <div className="ac-form-group">
              <div className="ac-label-row">
                <label htmlFor="title" className="ac-label">Article Title *</label>
                <span className={`ac-counter ${titleRemainingChars < 10 ? 'warning' : ''}`}>
                  {titleRemainingChars}
                </span>
              </div>
              <input 
                id="title"
                type="text"
                className={`ac-input ${uiState.errors.title ? 'error' : ''}`}
                placeholder="e.g., Mastering Blender Camera Controls"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                onBlur={(e) => handleFieldBlur('title', e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                required
              />
              {uiState.errors.title && (
                <span className="ac-error-text">{uiState.errors.title}</span>
              )}
            </div>

            <div className="ac-form-group">
              <div className="ac-label-row">
                <label htmlFor="description" className="ac-label">Short Description *</label>
                <span className={`ac-counter ${descRemainingChars < 20 ? 'warning' : ''}`}>
                  {descRemainingChars}
                </span>
              </div>
              <textarea 
                id="description"
                className={`ac-input ${uiState.errors.description ? 'error' : ''}`}
                placeholder={`A brief summary for the card view (max ${DESCRIPTION_MAX_LENGTH} characters).`}
                rows="3"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                onBlur={(e) => handleFieldBlur('description', e.target.value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
                required
              />
              {uiState.errors.description && (
                <span className="ac-error-text">{uiState.errors.description}</span>
              )}
            </div>

            <div className="ac-form-row">
              <div className="ac-form-group">
                <label htmlFor="category" className="ac-label">Category</label>
                <div className="ac-select-wrapper">
                  <select 
                    id="category"
                    className="ac-input"
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                  >
                    <option value="Tutorial">Tutorial</option>
                    <option value="Workflow">Workflow</option>
                    <option value="Guide">Guide</option>
                    <option value="News">News</option>
                  </select>
                  <div className="ac-select-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="ac-form-group">
                <label htmlFor="difficulty" className="ac-label">Difficulty</label>
                <div className="ac-select-wrapper">
                  <select 
                    id="difficulty"
                    className="ac-input"
                    value={formData.difficulty}
                    onChange={(e) => updateFormData('difficulty', e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="ac-select-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="ac-form-group">
                <label htmlFor="readTime" className="ac-label">Read Time (minutes) *</label>
                <input 
                  id="readTime"
                  type="number"
                  className={`ac-input ${uiState.errors.readTime ? 'error' : ''}`}
                  placeholder="e.g., 15"
                  min={MIN_READ_TIME}
                  max={MAX_READ_TIME}
                  value={formData.readTime}
                  onChange={(e) => updateFormData('readTime', e.target.value)}
                  onBlur={(e) => handleFieldBlur('readTime', e.target.value)}
                  required
                />
                {uiState.errors.readTime && (
                  <span className="ac-error-text">{uiState.errors.readTime}</span>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="ac-form-group">
              <label className="ac-label">Thumbnail *</label>
              <div className="ac-thumbnail-uploader">
                {formData.thumbnailPreview ? (
                  <div className="ac-thumbnail-preview">
                    <img src={formData.thumbnailPreview} alt="Thumbnail Preview" />
                    <div className="ac-thumbnail-actions">
                      <button 
                        type="button"
                        className="ac-btn ac-btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        Change
                      </button>
                      <button 
                        type="button"
                        className="ac-btn ac-btn-danger"
                        onClick={handleRemoveThumbnail}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`ac-thumbnail-placeholder ${uiState.errors.thumbnail ? 'error' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="ac-thumbnail-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                    <p>Upload Thumbnail</p>
                    <span>PNG, JPG, or WebP (max 5MB)</span>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept={VALID_IMAGE_TYPES.join(',')}
                  onChange={handleThumbnailChange}
                  style={{ display: 'none' }}
                />
              </div>
              {uiState.errors.thumbnail && (
                <span className="ac-error-text">{uiState.errors.thumbnail}</span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="ac-section">
            <h2 className="ac-section-title">Article Content</h2>
            <p className="ac-section-description">
              Drag blocks to reorder them. Add different types of content to engage your audience.
            </p>

            <div className={`ac-blocks-container ${dragState.isDragging ? 'dragging' : ''}`}>
              {blocks.map((block, index) => (
                <div key={block.id}>
                  {/* Drop indicator */}
                  {dragState.dragOverIndex === index && dragState.dropPosition === 'before' && (
                    <div className="ac-drop-indicator" />
                  )}

                  <div
                    className={`ac-block ${
                      dragState.dragOverIndex === index ? 'drag-over' : ''
                    } ${dragState.draggedBlock?.block.id === block.id ? 'dragging' : ''}`}
                    draggable={!uiState.isUploading}
                    onDragStart={(e) => handleDragStart(e, block.id, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {/* Drag Handle */}
                    <div className="ac-drag-handle" title="Drag to reorder">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="12" r="1"/>
                        <circle cx="9" cy="5" r="1"/>
                        <circle cx="9" cy="19" r="1"/>
                        <circle cx="15" cy="12" r="1"/>
                        <circle cx="15" cy="5" r="1"/>
                        <circle cx="15" cy="19" r="1"/>
                      </svg>
                    </div>

                    {/* Block Content */}
                    <div className="ac-block-content">
                      <div className="ac-block-type">
                        {getBlockIcon(block.type)}
                        <span>{getBlockTypeName(block.type)}</span>
                      </div>
                      
                      <div className="ac-block-editor">
                        {renderBlockContent(block)}
                      </div>
                    </div>

                    {/* Block Controls */}
                    <div className="ac-block-controls">
                      <div className="ac-block-add-menu">
                        <button 
                          onClick={() => addBlock('text', index + 1)} 
                          className="ac-block-btn add-text"
                          title="Add text block below"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          {getBlockIcon('text')}
                        </button>
                        
                        <button 
                          onClick={() => addBlock('image', index + 1)} 
                          className="ac-block-btn add-image"
                          title="Add image block below"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          {getBlockIcon('image')}
                        </button>
                        
                        <button 
                          onClick={() => addBlock('support', index + 1)} 
                          className="ac-block-btn add-support"
                          title="Add donation block below"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          {getBlockIcon('support')}
                        </button>
                        
                        <button 
                          onClick={() => addBlock('social', index + 1)} 
                          className="ac-block-btn add-social"
                          title="Add social media block below"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          {getBlockIcon('social')}
                        </button>
                        
                        <button 
                          onClick={() => addBlock('custom-link', index + 1)} 
                          className="ac-block-btn add-link"
                          title="Add custom link block below"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          {getBlockIcon('custom-link')}
                        </button>
                      </div>
                      
                      <div className="ac-block-actions">
                        <button 
                          onClick={() => duplicateBlock(block.id)} 
                          className="ac-block-btn duplicate"
                          title="Duplicate block"
                          disabled={uiState.isUploading}
                          type="button"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                          </svg>
                        </button>
                        
                        {blocks.length > 1 && (
                          <button 
                            onClick={() => removeBlock(block.id)} 
                            className="ac-block-btn remove"
                            title="Remove block"
                            disabled={uiState.isUploading}
                            type="button"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Drop indicator */}
                  {dragState.dragOverIndex === index && dragState.dropPosition === 'after' && (
                    <div className="ac-drop-indicator" />
                  )}
                </div>
              ))}
            </div>

            {uiState.errors.content && (
              <div className="ac-error-text" role="alert">
                {uiState.errors.content}
              </div>
            )}
          </div>

          {/* Publish Section */}
          <div className="ac-publish-section">
            <button 
              onClick={handlePublish}
              className="ac-btn ac-btn-primary ac-publish-btn"
              disabled={uiState.isUploading}
              type="button"
            >
              {uiState.isUploading ? (
                <>
                  <div className="ac-spinner" />
                  Publishing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="16,12 12,8 8,12"/>
                    <line x1="12" y1="16" x2="12" y2="8"/>
                  </svg>
                  Publish Article
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleCreator;