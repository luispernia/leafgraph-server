import Joi from 'joi';

/**
 * Validation schemas for user-related operations
 */
export const userValidation = {
  /**
   * Validation schema for creating a user
   */
  createUser: Joi.object({
    body: Joi.object({
      username: Joi.string().required().min(3).max(50)
        .messages({
          'string.base': 'Username must be a string',
          'string.empty': 'Username is required',
          'string.min': 'Username must be at least {#limit} characters',
          'string.max': 'Username cannot exceed {#limit} characters',
          'any.required': 'Username is required',
        }),
      email: Joi.string().required().email()
        .messages({
          'string.base': 'Email must be a string',
          'string.empty': 'Email is required',
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required',
        }),
      password: Joi.string().required().min(8)
        .messages({
          'string.base': 'Password must be a string',
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least {#limit} characters',
          'any.required': 'Password is required',
        }),
      firstName: Joi.string().allow(''),
      lastName: Joi.string().allow(''),
      role: Joi.string().valid('admin', 'user').default('user'),
      theme: Joi.string().default('light'),
    }),
  }),

  /**
   * Validation schema for getting a user by ID
   */
  getUserById: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.base': 'User ID must be a string',
          'string.empty': 'User ID is required',
          'any.required': 'User ID is required',
        }),
    }),
  }),

  /**
   * Validation schema for updating a user
   */
  updateUser: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.base': 'User ID must be a string',
          'string.empty': 'User ID is required',
          'any.required': 'User ID is required',
        }),
    }),
    body: Joi.object({
      email: Joi.string().email()
        .messages({
          'string.base': 'Email must be a string',
          'string.email': 'Please provide a valid email address',
        }),
      firstName: Joi.string().allow(''),
      lastName: Joi.string().allow(''),
      role: Joi.string().valid('admin', 'user'),
      theme: Joi.string(),
    }).min(1),
  }),

  /**
   * Validation schema for deleting a user
   */
  deleteUser: Joi.object({
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.base': 'User ID must be a string',
          'string.empty': 'User ID is required',
          'any.required': 'User ID is required',
        }),
    }),
  }),

  /**
   * Validation schema for user login
   */
  login: Joi.object({
    body: Joi.object({
      username: Joi.string().required()
        .messages({
          'string.base': 'Username must be a string',
          'string.empty': 'Username is required',
          'any.required': 'Username is required',
        }),
      password: Joi.string().required()
        .messages({
          'string.base': 'Password must be a string',
          'string.empty': 'Password is required',
          'any.required': 'Password is required',
        }),
    }),
  }),
}; 