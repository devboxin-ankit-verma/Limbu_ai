/**
 * User detail page - layout and composition only.
 * 
 * This module contains ONLY layout and composition.
 * NO API calls (use Services), NO business logic (use Hooks).
 */

import { useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { UserDetail } from '../components/UserDetail';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

/**
 * User detail page component.
 * 
 * This page composes components and hooks.
 * It does NOT make API calls directly.
 * It does NOT contain business logic.
 */
export const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, error } = useUser(userId!);
  
  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error.message} />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="page-container">
        <ErrorMessage message="User not found" />
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <h1>User Details</h1>
      <UserDetail user={user} />
    </div>
  );
};
