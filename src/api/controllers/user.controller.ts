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
      
      // Set authentication cookies
      tokenService.setAuthCookies(res, user);
      
      // Return only user data (tokens are in cookies)
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          user
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
      // Get refresh token from cookie instead of request body
      const refreshToken = req.cookies.refresh_token;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }
      
      // Verify the refresh token
      const decoded = tokenService.verifyToken(refreshToken, TokenType.REFRESH);
      
      if (!decoded) {
        // Clear invalid cookies
        tokenService.clearAuthCookies(res);
        
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
        return;
      }
      
      // Get the user from the database
      const user = await userService.findUserById(decoded.id);
      
      if (!user) {
        // Clear cookies if user not found
        tokenService.clearAuthCookies(res);
        
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      // Set new cookies with fresh tokens
      tokenService.setAuthCookies(res, user);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully'
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

  /**
   * Logout a user by clearing authentication cookies
   * @param req - The request object
   * @param res - The response object
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear authentication cookies
      tokenService.clearAuthCookies(res);
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Error in logout controller', { error });
      
      res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user preferences (theme and other settings)
   * @param req - The request object
   * @param res - The response object
   */
  async getUserPreferences(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      logger.info("getUserPreferences controller", { id });
      // Check if user is requesting their own preferences or if they're an admin
      if (req.user?.id !== id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Unauthorized to access these preferences',
        });
        return;
      }
      
      const user = await userService.findUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      // Extract only the preference-related fields
      const preferences = {
        theme: user.theme || 'light',
      };
      
      res.status(200).json({
        success: true,
        data: {preferences},
      });
    } catch (error) {
      logger.error('Error in getUserPreferences controller', { error, id: req.params.id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user preferences',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
} 