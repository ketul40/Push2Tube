/**
 * Error Notification Component
 * Displays toast notifications for errors and modal for critical errors
 */

import React, { useState, useEffect } from 'react';
import { ErrorResponse, ErrorSeverity } from '../types';
import { formatErrorMessage, getErrorSeverity, isCriticalError } from '../utils/errorHandler';
import './ErrorNotification.css';

interface ToastError extends ErrorResponse {
  id: string;
  severity: ErrorSeverity;
  onRetry?: () => void;
}

interface ErrorNotificationProps {
  error: ErrorResponse | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

// Global toast management
let toastId = 0;
const toastListeners: Set<(toasts: ToastError[]) => void> = new Set();
let currentToasts: ToastError[] = [];

function notifyToastListeners() {
  toastListeners.forEach(listener => listener([...currentToasts]));
}

export function showToast(error: ErrorResponse, onRetry?: () => void) {
  const toast: ToastError = {
    ...error,
    id: `toast-${++toastId}`,
    severity: getErrorSeverity(error),
    onRetry,
  };
  
  currentToasts.push(toast);
  notifyToastListeners();
  
  // Auto-hide after 5 seconds for non-critical errors
  if (!isCriticalError(error)) {
    setTimeout(() => {
      hideToast(toast.id);
    }, 5000);
  }
}

export function hideToast(id: string) {
  currentToasts = currentToasts.filter(t => t.id !== id);
  notifyToastListeners();
}

export function clearAllToasts() {
  currentToasts = [];
  notifyToastListeners();
}

/**
 * Toast Container Component
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastError[]>([]);
  
  useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div className="error-toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

/**
 * Individual Toast Component
 */
function Toast({ toast }: { toast: ToastError }) {
  const handleClose = () => {
    hideToast(toast.id);
  };
  
  const handleRetry = () => {
    if (toast.onRetry) {
      toast.onRetry();
    }
    hideToast(toast.id);
  };
  
  const getIcon = () => {
    switch (toast.severity) {
      case ErrorSeverity.INFO:
        return 'ℹ';
      case ErrorSeverity.WARNING:
        return '⚠';
      case ErrorSeverity.ERROR:
        return '✕';
      case ErrorSeverity.CRITICAL:
        return '!';
      default:
        return '✕';
    }
  };
  
  return (
    <div className={`error-toast ${toast.severity}`}>
      <div className="error-toast-icon">
        {getIcon()}
      </div>
      <div className="error-toast-content">
        <div className="error-toast-message">
          {formatErrorMessage(toast)}
        </div>
        {(toast.retryable || toast.onRetry) && (
          <div className="error-toast-actions">
            {toast.onRetry && (
              <button className="error-toast-button retry" onClick={handleRetry}>
                Retry
              </button>
            )}
            <button className="error-toast-button dismiss" onClick={handleClose}>
              Dismiss
            </button>
          </div>
        )}
      </div>
      <button className="error-toast-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
}

/**
 * Error Modal Component for Critical Errors
 */
export function ErrorModal({ error, onRetry, onDismiss }: ErrorNotificationProps) {
  if (!error || !isCriticalError(error)) {
    return null;
  }
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onDismiss) {
      onDismiss();
    }
  };
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    if (onDismiss) {
      onDismiss();
    }
  };
  
  return (
    <div className="error-modal-overlay" onClick={handleOverlayClick}>
      <div className="error-modal">
        <div className="error-modal-header">
          <div className="error-modal-icon">!</div>
          <h2 className="error-modal-title">Authentication Error</h2>
        </div>
        <div className="error-modal-message">
          {formatErrorMessage(error)}
        </div>
        {error.details && (
          <div className="error-modal-details">
            {error.details}
          </div>
        )}
        <div className="error-modal-actions">
          {onDismiss && (
            <button className="error-modal-button secondary" onClick={onDismiss}>
              Close
            </button>
          )}
          {error.retryable && onRetry && (
            <button className="error-modal-button primary" onClick={handleRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main Error Notification Component
 * Can be used for inline error display
 */
export default function ErrorNotification({ 
  error, 
  onRetry, 
  onDismiss,
  autoHideDuration = 5000 
}: ErrorNotificationProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (error) {
      setVisible(true);
      
      // Auto-hide for non-critical errors
      if (!isCriticalError(error) && autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onDismiss) {
            onDismiss();
          }
        }, autoHideDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [error, autoHideDuration, onDismiss]);
  
  if (!error || !visible) {
    return null;
  }
  
  // Show modal for critical errors
  if (isCriticalError(error)) {
    return <ErrorModal error={error} onRetry={onRetry} onDismiss={onDismiss} />;
  }
  
  // Show toast for non-critical errors
  const severity = getErrorSeverity(error);
  
  return (
    <div className={`error-toast ${severity}`}>
      <div className="error-toast-icon">
        {severity === ErrorSeverity.WARNING ? '⚠' : '✕'}
      </div>
      <div className="error-toast-content">
        <div className="error-toast-message">
          {formatErrorMessage(error)}
        </div>
        {(error.retryable || onRetry) && (
          <div className="error-toast-actions">
            {onRetry && (
              <button className="error-toast-button retry" onClick={onRetry}>
                Retry
              </button>
            )}
            {onDismiss && (
              <button className="error-toast-button dismiss" onClick={onDismiss}>
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button className="error-toast-close" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
