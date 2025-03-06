import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJwt, authorizeRoles } from '../../middleware/auth.middleware';
// import { validateRequest } from '../../middleware/validation.middleware';
// import { userValidation } from '../validations/user.validation';

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
  // validateRequest(userValidation.getUserById),
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
  // validateRequest(userValidation.updateUser),
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
  // validateRequest(userValidation.deleteUser),
  userController.deleteUser.bind(userController)
);

export default router; 