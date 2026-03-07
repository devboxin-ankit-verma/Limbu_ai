/**
 * User detail component - UI only.
 * 
 * This module contains ONLY UI rendering.
 * NO API calls, NO routing logic, NO business logic.
 */

import { User } from '../types/User';

interface UserDetailProps {
  user: User;
}

/**
 * User detail component.
 * 
 * This is a pure UI component.
 * It receives data via props.
 * It does NOT make API calls.
 * It does NOT contain routing logic.
 */
export const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <div className="user-detail">
      <div className="user-field">
        <label>Username:</label>
        <span>{user.username}</span>
      </div>
      <div className="user-field">
        <label>Email:</label>
        <span>{user.email}</span>
      </div>
      <div className="user-field">
        <label>ID:</label>
        <span>{user.id}</span>
      </div>
    </div>
  );
};
