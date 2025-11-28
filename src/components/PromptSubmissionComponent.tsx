import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { createVideoJob } from '../services/videoJobService';
import { getUserById, updateUserPreferences } from '../services/userService';
import { showToast } from './ErrorNotification';
import { createErrorResponse, parseFirebaseError, ErrorCode } from '../utils/errorHandler';
import './PromptSubmissionComponent.css';

interface PromptSubmissionComponentProps {
  user: FirebaseUser;
  onJobCreated?: (jobId: string) => void;
}

/**
 * PromptSubmissionComponent
 * Handles prompt submission for video generation
 * Requirements: 3.1, 3.2, 10.1, 10.2, 10.4, 10.5
 */
const PromptSubmissionComponent: React.FC<PromptSubmissionComponentProps> = ({ user, onJobCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('unlisted');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [defaultPrivacy, setDefaultPrivacy] = useState('unlisted');

  // Load user's default privacy preference on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const userData = await getUserById(user.uid);
        if (userData && userData.defaultPrivacyStatus) {
          setDefaultPrivacy(userData.defaultPrivacyStatus);
          setPrivacyStatus(userData.defaultPrivacyStatus);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user.uid]);

  // Validate prompt (non-empty check)
  const validatePrompt = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setValidationError('Prompt cannot be empty');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Handle prompt input change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    
    // Clear validation error when user starts typing
    if (validationError && value.trim() !== '') {
      setValidationError(null);
    }
    
    // Clear success message when user starts typing again
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Handle privacy status change
  const handlePrivacyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrivacy = e.target.value;
    setPrivacyStatus(newPrivacy);
    
    // Save as new default preference if different from current default
    if (newPrivacy !== defaultPrivacy) {
      try {
        await updateUserPreferences(user.uid, {
          defaultPrivacyStatus: newPrivacy,
        });
        setDefaultPrivacy(newPrivacy);
      } catch (error) {
        console.error('Error updating privacy preference:', error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate prompt
    if (!validatePrompt(prompt)) {
      const validationError = createErrorResponse(
        ErrorCode.VALIDATION_EMPTY_PROMPT,
        'Prompt cannot be empty'
      );
      showToast(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create video job
      const jobId = await createVideoJob(user.uid, prompt, privacyStatus);
      
      // Clear form
      setPrompt('');
      setSubmitSuccess(true);
      
      // Notify parent component
      if (onJobCreated) {
        onJobCreated(jobId);
      }
    } catch (error) {
      console.error('Error creating video job:', error);
      const errorResponse = parseFirebaseError(error);
      showToast(errorResponse, () => handleSubmit(e));
      setSubmitError(errorResponse.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prompt-submission-container">
      <h2>Generate AI Video</h2>
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="form-group">
          <label htmlFor="prompt">
            Video Prompt
            <span className="required">*</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe the video you want to generate..."
            rows={5}
            className={validationError ? 'error' : ''}
            disabled={isSubmitting}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'prompt-error' : undefined}
          />
          {validationError && (
            <p id="prompt-error" className="error-message" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="privacy">Privacy Status</label>
          <select
            id="privacy"
            value={privacyStatus}
            onChange={handlePrivacyChange}
            disabled={isSubmitting}
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
          <p className="help-text">
            Your default privacy setting: {defaultPrivacy}
          </p>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !prompt.trim()}
        >
          {isSubmitting ? 'Creating Job...' : 'Generate Video'}
        </button>

        {submitError && (
          <p className="error-message" role="alert">
            {submitError}
          </p>
        )}

        {submitSuccess && (
          <p className="success-message" role="status">
            Video job created successfully! Check the job monitor for progress.
          </p>
        )}
      </form>
    </div>
  );
};

export default PromptSubmissionComponent;
