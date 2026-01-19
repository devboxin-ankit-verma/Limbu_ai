/**
 * User routes - route definitions only.
 * 
 * This module contains ONLY route definitions.
 * Controllers handle request/response.
 */

import { Router } from 'express';
import * as userController from '../../controllers/userController';

const router = Router();

router.get('/users', userController.getUsers);
router.get('/users/:userId', userController.getUser);
router.post('/users', userController.createUser);
router.put('/users/:userId', userController.updateUser);
router.delete('/users/:userId', userController.deleteUser);

export { router as userRoutes };
