/**
 * User list component - UI only.
 * 
 * This module contains ONLY UI rendering.
 * NO API calls, NO routing logic, NO business logic.
 */

import { User } from '../types/User';

interface UserListProps {
  users: User[];
  onUserClick?: (userId: number | string) => void;
}

/**
 * User list component.
 * 
 * This is a pure UI component.
 * It receives data via props and emits events via callbacks.
 * It does NOT make API calls.
 * It does NOT contain routing logic.
 */
export const UserList = ({ users, onUserClick }: UserListProps) => {
  return (
    <ul className="user-list">
      {users.map((user) => (
        <li
          key={user.id}
          className="user-item"
          onClick={() => onUserClick?.(user.id)}
        >
          <div className="user-name">{user.username}</div>
          <div className="user-email">{user.email}</div>
        </li>
      ))}
    </ul>
  );
};
