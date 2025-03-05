import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

/**
 * Middleware for validating request data using Joi schemas
 * @param schema - The Joi validation schema
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true, // Remove unknown props
    };

    // Determine which part of the request to validate
    const dataToValidate: Record<string, any> = {};
    
    // Add body if it exists and schema has body validation
    if (req.body && schema.extract('body')) {
      dataToValidate['body'] = req.body;
    }
    
    // Add params if they exist and schema has params validation
    if (req.params && schema.extract('params')) {
      dataToValidate['params'] = req.params;
    }
    
    // Add query if it exists and schema has query validation
    if (req.query && schema.extract('query')) {
      dataToValidate['query'] = req.query;
    }

    // Validate the request data
    const { error, value } = schema.validate(dataToValidate, validationOptions);

    if (error) {
      // Format validation errors
      const errorDetails = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      logger.warn('Request validation failed', { 
        path: req.path, 
        method: req.method,
        errors: errorDetails 
      });

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails,
      });
    }

    // Replace request properties with validated data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    return next();
  };
}; 