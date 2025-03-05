import { User, IUser } from '../models/user.model';
import logger from '../utils/logger';
import { dbService } from '../db/database.service';

/**
 * Interface for user creation data
 */
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user';
}

/**
 * Interface for user update data
 */
export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user';
}

/**
 * Service for user-related operations
 */
export class UserService {
  /**
   * Create a new user
   * @param userData - The user data
   * @returns The created user
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      // Create the user
      const user = new User(userData);
      await user.save();
      
      logger.info(`User created: ${user.username}`);
      
      // Return the user without the password
      const userObject = user.toObject();
      const { password, ...userWithoutPassword } = userObject;
      
      return userWithoutPassword as unknown as IUser;
    } catch (error) {
      logger.error('Error creating user', { error, userData: { ...userData, password: '[REDACTED]' } });
      throw error;
    }
  }

  /**
   * Find a user by ID
   * @param id - The user ID
   * @returns The user or null if not found
   */
  async findUserById(id: string): Promise<IUser | null> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      const user = await User.findById(id).select('-password');
      return user;
    } catch (error) {
      logger.error('Error finding user by ID', { error, id });
      throw error;
    }
  }

  /**
   * Find a user by username
   * @param username - The username
   * @returns The user or null if not found
   */
  async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      const user = await User.findOne({ username }).select('-password');
      return user;
    } catch (error) {
      logger.error('Error finding user by username', { error, username });
      throw error;
    }
  }

  /**
   * Find a user by email
   * @param email - The email
   * @returns The user or null if not found
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      const user = await User.findOne({ email }).select('-password');
      return user;
    } catch (error) {
      logger.error('Error finding user by email', { error, email });
      throw error;
    }
  }

  /**
   * Update a user
   * @param id - The user ID
   * @param updateData - The data to update
   * @returns The updated user
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (user) {
        logger.info(`User updated: ${user.username}`);
      }
      
      return user;
    } catch (error) {
      logger.error('Error updating user', { error, id, updateData });
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id - The user ID
   * @returns True if the user was deleted, false otherwise
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      const result = await User.findByIdAndDelete(id);
      
      if (result) {
        logger.info(`User deleted: ${result.username}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting user', { error, id });
      throw error;
    }
  }

  /**
   * Authenticate a user
   * @param username - The username
   * @param password - The password
   * @returns The user if authentication is successful, null otherwise
   */
  async authenticateUser(username: string, password: string): Promise<IUser | null> {
    try {
      // Ensure database connection
      if (!dbService.isConnected()) {
        await dbService.connect();
      }
      
      // Find the user with the password
      const user = await User.findOne({ username });
      
      if (!user) {
        return null;
      }
      
      // Compare the password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return null;
      }
      
      // Return the user without the password
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;
      
      return userWithoutPassword as unknown as IUser;
    } catch (error) {
      logger.error('Error authenticating user', { error, username });
      throw error;
    }
  }
} 