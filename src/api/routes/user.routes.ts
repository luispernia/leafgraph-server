import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJwt, authorizeRoles } from '../../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticateJwt,
  userController.getCurrentUser.bind(userController)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateJwt,
  userController.getUserById.bind(userController)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Private
 */
router.put(
  '/:id',
  authenticateJwt,
  userController.updateUser.bind(userController)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticateJwt,
  authorizeRoles(['admin']),
  userController.deleteUser.bind(userController)
);

export default router; 