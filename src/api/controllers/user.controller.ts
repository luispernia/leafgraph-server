import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { TokenService, TokenType } from '../../services/token.service';
import logger from '../../utils/logger';
import { AuthRequest } from '../../middleware/auth.middleware';

// Create a user service instance
const userService = new UserService();
// Create a token service instance
const tokenService = new TokenService();

/**
 * User controller for handling HTTP requests related to users
 */
export class UserController {
  /**
   * Create a new user
   * @param req - The request object
   * @param res - The response object
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in createUser controller', { error });
      
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get a user by ID
   * @param req - The request object
   * @param res - The response object
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.findUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getUserById controller', { error, id: req.params.id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a user
   * @param req - The request object
   * @param res - The response object
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await userService.updateUser(id, updateData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in updateUser controller', { error, id: req.params.id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a user
   * @param req - The request object
   * @param res - The response object
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteUser controller', { error, id: req.params.id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Authenticate a user
   * @param req - The request object
   * @param res - The response object
   */
  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
        return;
      }
      
      const user = await userService.authenticateUser(username, password);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }
      
      // Generate JWT tokens
      const tokens = tokenService.generateAuthTokens(user);
      
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          user,
          tokens
        }
      });
    } catch (error) {
      logger.error('Error in authenticateUser controller', { error });
      
      res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Refresh a user's access token using a refresh token
   * @param req - The request object
   * @param res - The response object
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }
      
      // Verify the refresh token
      const decoded = tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
        return;
      }
      
      // Get the user from the database
      const user = await userService.findUserById(decoded.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      // Generate a new access token
      const accessToken = tokenService.generateAccessToken(user);
      
      res.status(200).json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      logger.error('Error in refreshToken controller', { error });
      
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get the current user's profile
   * @param req - The request object
   * @param res - The response object
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }
      
      const user = await userService.findUserById(req.user.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in getCurrentUser controller', { error });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 