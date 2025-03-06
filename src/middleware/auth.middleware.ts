import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { UserService } from '../services/user.service';
import logger from '../utils/logger';

// Create an instance of the UserService
const userService = new UserService();

// Extended Request interface to include the user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * Middleware to authenticate users via JWT
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
export const authenticateJwt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the token from cookies (preferred) or Authorization header (fallback)
    const tokenFromCookie = req.cookies.access_token;
    const authHeader = req.headers.authorization;
    
    let token = tokenFromCookie;
    
    // Fallback to Authorization header if no cookie (for backwards compatibility)
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token is provided, return unauthorized
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
      return;
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        username: string;
        role: string;
      };
      
      // Assign the decoded user to the request object
      req.user = decoded;
      
      // Continue to the next middleware
      next();
    } catch (error) {
      logger.error('JWT verification failed', { error });
      
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware to restrict routes to specific roles
 * @param roles - Array of allowed roles
 * @returns Middleware function
 */
export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // If the user is not authenticated or has no role, return forbidden
    if (!req.user || !req.user.role) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Missing role information',
      });
      return;
    }
    
    // Check if the user's role is allowed
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
      });
      return;
    }
    
    // User is authorized, continue to the next middleware
    next();
  };
}; 