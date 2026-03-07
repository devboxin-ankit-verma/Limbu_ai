/**
 * Error message component - UI only.
 * 
 * This module contains ONLY UI rendering.
 */

interface ErrorMessageProps {
  message: string;
}

/**
 * Error message component.
 * 
 * Pure UI component for displaying error messages.
 */
export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
    </div>
  );
};
