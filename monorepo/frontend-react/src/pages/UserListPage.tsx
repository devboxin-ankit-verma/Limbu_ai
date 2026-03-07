/**
 * User list page - layout and composition only.
 * 
 * This module contains ONLY layout and composition.
 * NO API calls (use Services), NO business logic (use Hooks).
 */

import { useUsers } from '../hooks/useUsers';
import { UserList } from '../components/UserList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

/**
 * User list page component.
 * 
 * This page composes components and hooks.
 * It does NOT make API calls directly.
 * It does NOT contain business logic.
 */
export const UserListPage = () => {
  // Use hook for business logic and data fetching
  const { users, loading, error } = useUsers();
  
  // Handle loading state
  if (loading) {
    return (
      <div className="page-container">
        <h1>Users</h1>
        <LoadingSpinner />
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="page-container">
        <h1>Users</h1>
        <ErrorMessage message={error.message} />
      </div>
    );
  }
  
  // Render page with composed components
  return (
    <div className="page-container">
      <h1>Users</h1>
      <UserList users={users} />
    </div>
  );
};
