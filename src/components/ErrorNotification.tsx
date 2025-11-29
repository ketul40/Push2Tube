import { Toaster } from 'sonner';

/**
 * ErrorNotification Component
 * Uses sonner for toast notifications
 * Export Toaster component to be used in App
 */

// Export ToastContainer as Toaster for backward compatibility
export const ToastContainer = Toaster;

// The toast function is imported directly from 'sonner' where needed
// import { toast } from 'sonner';
// toast.success('Message');
// toast.error('Error');
// toast.info('Info');
// toast.warning('Warning');
