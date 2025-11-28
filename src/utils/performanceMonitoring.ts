import { performance } from '../config/firebase';
import { trace } from 'firebase/performance';

/**
 * Track page load performance
 * @param pageName Name of the page being loaded
 */
export const trackPageLoad = (pageName: string) => {
  const pageTrace = trace(performance, `page_load_${pageName}`);
  pageTrace.start();
  
  // Stop trace when page is fully loaded
  if (document.readyState === 'complete') {
    pageTrace.stop();
  } else {
    window.addEventListener('load', () => {
      pageTrace.stop();
    });
  }
  
  return pageTrace;
};

/**
 * Track API call duration
 * @param apiName Name of the API being called
 * @returns Object with start and stop methods
 */
export const trackAPICall = (apiName: string) => {
  const apiTrace = trace(performance, `api_call_${apiName}`);
  
  return {
    start: () => apiTrace.start(),
    stop: () => apiTrace.stop(),
    addAttribute: (name: string, value: string) => apiTrace.putAttribute(name, value),
    addMetric: (name: string, value: number) => apiTrace.putMetric(name, value),
  };
};

/**
 * Track custom operation duration
 * @param operationName Name of the operation
 * @returns Object with start and stop methods
 */
export const trackCustomOperation = (operationName: string) => {
  const customTrace = trace(performance, operationName);
  
  return {
    start: () => customTrace.start(),
    stop: () => customTrace.stop(),
    addAttribute: (name: string, value: string) => customTrace.putAttribute(name, value),
    addMetric: (name: string, value: number) => customTrace.putMetric(name, value),
  };
};

/**
 * Wrap an async function with performance tracking
 * @param operationName Name of the operation
 * @param fn Async function to track
 * @returns Wrapped function
 */
export const withPerformanceTracking = <T extends (...args: any[]) => Promise<any>>(
  operationName: string,
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    const tracker = trackCustomOperation(operationName);
    tracker.start();
    
    try {
      const result = await fn(...args);
      tracker.addAttribute('status', 'success');
      return result;
    } catch (error) {
      tracker.addAttribute('status', 'error');
      tracker.addAttribute('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      tracker.stop();
    }
  }) as T;
};
