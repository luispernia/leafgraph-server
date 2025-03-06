import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { userValidation } from '../validations/user.validation';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and get tokens
 * @access  Public
 */
router.post(
  '/login',
  validateRequest(userValidation.login),
  userController.authenticateUser.bind(userController)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validateRequest(userValidation.refreshToken),
  userController.refreshToken.bind(userController)
);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateRequest(userValidation.createUser),
  userController.createUser.bind(userController)
);

export default router; 