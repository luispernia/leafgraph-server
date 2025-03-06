import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import config from './config/config';
import { dbService } from './db/database.service';
import logger from './utils/logger';
import userRoutes from './api/routes/user.routes';
import authRoutes from './api/routes/auth.routes';

// Create Express app
const app = express();

// Apply security middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(cookieParser()); // Add cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LeafGraph Server is running',
    environment: config.env,
    database: {
      connected: dbService.isConnected(),
      type: 'mongodb',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err });
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.isDevelopment ? err.message : 'Something went wrong',
  });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to the database
    await dbService.connect();
    
    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port} in ${config.env} mode`);
    });
    
    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down server...');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await dbService.disconnect();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing database connection', { error });
          process.exit(1);
        }
      });
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Start the server
startServer(); 