import mongoose from 'mongoose';
import { DatabaseProvider, DatabaseConfig, ConnectionEvent } from '../interfaces/database.interface';
import logger from '../../utils/logger';

/**
 * MongoDB implementation of the DatabaseProvider interface
 */
export class MongoDBProvider implements DatabaseProvider {
  private connection: mongoose.Connection | null = null;
  private connectionEvents: ConnectionEvent[] = [];
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected()) {
        logger.info('MongoDB connection already established');
        return;
      }

      logger.info('Connecting to MongoDB...');
      
      // Build connection options
      const options: mongoose.ConnectOptions = {
        ...this.config.options,
      };
      
      // Add auth credentials if provided
      if (this.config.user && this.config.pass) {
        options.auth = {
          username: this.config.user as string,
          password: this.config.pass as string
        };
      }
      
      // Connect to MongoDB
      await mongoose.connect(this.config.uri, options);
      
      this.connection = mongoose.connection;
      
      // Set up connection event listeners
      this.connection.on('connected', () => {
        const event: ConnectionEvent = {
          type: 'connected',
          timestamp: new Date(),
          message: 'MongoDB connection established'
        };
        this.connectionEvents.push(event);
        logger.info(event.message);
      });
      
      this.connection.on('disconnected', () => {
        const event: ConnectionEvent = {
          type: 'disconnected',
          timestamp: new Date(),
          message: 'MongoDB disconnected'
        };
        this.connectionEvents.push(event);
        logger.warn(event.message);
      });
      
      this.connection.on('error', (err) => {
        const event: ConnectionEvent = {
          type: 'error',
          timestamp: new Date(),
          message: `MongoDB connection error: ${err.message}`
        };
        this.connectionEvents.push(event);
        logger.error(`MongoDB connection error: ${err.message}`, { error: err });
      });
      
      logger.info('MongoDB connection successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const event: ConnectionEvent = {
        type: 'error',
        timestamp: new Date(),
        message: `Failed to connect to MongoDB: ${errorMessage}`
      };
      this.connectionEvents.push(event);
      logger.error(`Failed to connect to MongoDB: ${errorMessage}`, { error });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('Disconnected from MongoDB');
    }
  }

  /**
   * Check if connected to MongoDB
   */
  isConnected(): boolean {
    return this.connection !== null && this.connection.readyState === 1;
  }

  /**
   * Get the native MongoDB connection
   */
  getConnection(): mongoose.Connection {
    if (!this.connection) {
      throw new Error('MongoDB connection not established');
    }
    return this.connection;
  }

  /**
   * Execute a raw MongoDB query
   * @param query - The query string (MongoDB command)
   * @param params - Query parameters
   */
  async executeRawQuery(query: string, params: any[] = []): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('Cannot execute query: MongoDB connection not established');
    }
    
    try {
      // For MongoDB, we'll interpret the query as a JSON command to be executed
      const db = this.connection?.db;
      if (!db) {
        throw new Error('MongoDB database instance not available');
      }
      const command = JSON.parse(query);
      
      // Execute the command
      return await db.command(command);
    } catch (error) {
      logger.error('Error executing MongoDB query', { error, query, params });
      throw error;
    }
  }

  /**
   * Get connection events history
   */
  getConnectionEvents(): ConnectionEvent[] {
    return [...this.connectionEvents];
  }
} 