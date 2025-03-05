import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
// import { validateRequest } from '../../middleware/validation.middleware';
// import { userValidation } from '../validations/user.validation';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post(
  '/',
  // validateRequest(userValidation.createUser),
  userController.createUser.bind(userController)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Private
 */
router.get(
  '/:id',
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
  // validateRequest(userValidation.updateUser),
  userController.updateUser.bind(userController)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private
 */
router.delete(
  '/:id',
  // validateRequest(userValidation.deleteUser),
  userController.deleteUser.bind(userController)
);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate a user
 * @access  Public
 */
router.post(
  '/login',
  // validateRequest(userValidation.login),
  userController.authenticateUser.bind(userController)
);

export default router; 