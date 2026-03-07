/**
 * Loading spinner component - UI only.
 * 
 * This module contains ONLY UI rendering.
 */

/**
 * Loading spinner component.
 * 
 * Pure UI component for displaying loading state.
 */
export const LoadingSpinner = () => {
  return (
    <div className="loading-spinner" aria-label="Loading">
      <div className="spinner"></div>
    </div>
  );
};
