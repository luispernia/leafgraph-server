import dotenv from 'dotenv';
import joi from 'joi';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define validation schema for environment variables
const envVarsSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(3000),
  
  // Client URL for CORS
  CLIENT_URL: joi.string().default('http://localhost:5173').description('Client URL for CORS'),
  
  // MongoDB Configuration
  MONGODB_URI: joi.string().required().description('MongoDB connection string'),
  MONGODB_USER: joi.string().allow('').description('MongoDB username'),
  MONGODB_PASS: joi.string().allow('').description('MongoDB password'),
  
  // JWT Configuration
  JWT_SECRET: joi.string().required().description('JWT secret key'),
  JWT_EXPIRATION: joi.string().default('1d').description('JWT expiration time'),
  
  // Logging
  LOG_LEVEL: joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: joi.number().default(15 * 60 * 1000).description('Rate limiting window in milliseconds'),
  RATE_LIMIT_MAX_REQUESTS: joi.number().default(100).description('Maximum requests in rate limiting window'),
}).unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export validated config
export default {
  env: envVars.NODE_ENV,
  isProduction: envVars.NODE_ENV === 'production',
  isDevelopment: envVars.NODE_ENV === 'development',
  isTest: envVars.NODE_ENV === 'test',
  port: envVars.PORT,
  
  // Client URL
  clientUrl: envVars.CLIENT_URL,
  
  mongodb: {
    uri: envVars.MONGODB_URI,
    user: envVars.MONGODB_USER,
    pass: envVars.MONGODB_PASS,
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expiration: envVars.JWT_EXPIRATION,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
  },
  
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
}; 