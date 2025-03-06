import jwt from 'jsonwebtoken';
import { Response } from 'express';
import config from '../config/config';
import { IUser } from '../models/user.model';
import logger from '../utils/logger';

/**
 * Token types enum
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

/**
 * Token payload interface
 */
interface TokenPayload {
  id: string;
  username: string;
  role: string;
  type: TokenType;
}

/**
 * Cookie options for tokens
 */
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction, // secure in production
  sameSite: config.isProduction ? 'none' : 'lax' as 'none' | 'lax',
  path: '/',
};

// Access token cookie expires with the token
const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Refresh token cookie (longer expiry)
const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Service for handling JWT tokens
 */
export class TokenService {
  /**
   * Generate an access token for a user
   * @param user - The user to generate a token for
   * @returns The generated access token
   */
  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user._id instanceof Object ? user._id.toString() : String(user._id),
      username: user.username,
      role: user.role,
      type: TokenType.ACCESS,
    };
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '15m', // Shorter expiration for access tokens
    });
  }
  
  /**
   * Generate a refresh token for a user
   * @param user - The user to generate a token for
   * @returns The generated refresh token
   */
  generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user._id instanceof Object ? user._id.toString() : String(user._id),
      username: user.username,
      role: user.role,
      type: TokenType.REFRESH,
    };
    
    // Refresh tokens should have a longer expiry than access tokens
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d',
    });
  }
  
  /**
   * Verify a token and return the decoded payload
   * @param token - The token to verify
   * @param type - The expected token type
   * @returns The decoded token payload or null if invalid
   */
  verifyToken(token: string, type: TokenType): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      // Check if the token type matches the expected type
      if (decoded.type !== type) {
        logger.warn('Token type mismatch', {
          expected: type,
          actual: decoded.type,
        });
        return null;
      }
      
      return decoded;
    } catch (error) {
      logger.error('Token verification failed', { error });
      return null;
    }
  }
  
  /**
   * Generate both access and refresh tokens for a user
   * @param user - The user to generate tokens for
   * @returns An object containing the access and refresh tokens
   */
  generateAuthTokens(user: IUser): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Set authentication cookies in the response
   * @param res - Express response object
   * @param user - User to generate tokens for
   */
  setAuthCookies(res: Response, user: IUser): void {
    const { accessToken, refreshToken } = this.generateAuthTokens(user);
    // Set cookies
    res.cookie('access_token', accessToken, accessTokenCookieOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);
    
    logger.debug('Auth cookies set successfully');
  }
  
  /**
   * Clear authentication cookies from the response
   * @param res - Express response object
   */
  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
    
    logger.debug('Auth cookies cleared successfully');
  }
} 