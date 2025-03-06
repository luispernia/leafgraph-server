import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../utils/logger';

/**
 * Middleware for validating request data using Joi schemas
 * @param schema - The Joi validation schema
 * @returns Express middleware function
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true, // Remove unknown props
    };

    // Determine which part of the request to validate
    const dataToValidate: Record<string, any> = {};
    
    // Add body if it exists
    if (req.body && Object.keys(req.body).length > 0) {
      dataToValidate.body = req.body;
    }
    
    // Add params if they exist
    if (req.params && Object.keys(req.params).length > 0) {
      dataToValidate.params = req.params;
    }
    
    // Add query if it exists
    if (req.query && Object.keys(req.query).length > 0) {
      dataToValidate.query = req.query;
    }

    // Validate the request data
    const { error, value } = schema.validate(req.body, validationOptions);

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

      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails,
      });
      return;
    }

    // Replace request properties with validated data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};