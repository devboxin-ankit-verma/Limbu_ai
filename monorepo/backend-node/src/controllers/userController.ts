/**
 * User controller — delegates to adminController for backward compatibility.
 */

export { listUsers as getUsers, listUsers as getUser, listUsers as createUser, listUsers as updateUser, listUsers as deleteUser } from './adminController';
