import { DatabaseFactory, DatabaseType } from './database.factory';
import { DatabaseProvider, DatabaseConfig } from './interfaces/database.interface';
import config from '../config/config';
import logger from '../utils/logger';

/**
 * Service class for database operations
 */
export class DatabaseService {
  private provider: DatabaseProvider;
  private dbType: DatabaseType;

  /**
   * Create a new DatabaseService
   * @param dbType - The type of database to use
   * @param dbConfig - The database configuration
   */
  constructor(dbType: DatabaseType = 'mongodb', dbConfig?: DatabaseConfig) {
    this.dbType = dbType;
    
    // Use provided config or load from environment
    const configuration = dbConfig || this.getConfigFromEnv(dbType);
    
    // Create the database provider
    this.provider = DatabaseFactory.createProvider(dbType, configuration);
    
    logger.info(`Database service initialized with ${dbType} provider`);
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    try {
      await this.provider.connect();
      logger.info(`Connected to ${this.dbType} database`);
    } catch (error) {
      logger.error(`Failed to connect to ${this.dbType} database`, { error });
      throw error;
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    try {
      await this.provider.disconnect();
      logger.info(`Disconnected from ${this.dbType} database`);
    } catch (error) {
      logger.error(`Error disconnecting from ${this.dbType} database`, { error });
      throw error;
    }
  }

  /**
   * Check if connected to the database
   */
  isConnected(): boolean {
    return this.provider.isConnected();
  }

  /**
   * Get the database provider
   */
  getProvider(): DatabaseProvider {
    return this.provider;
  }

  /**
   * Execute a raw query
   * @param query - The query string
   * @param params - Query parameters
   */
  async executeRawQuery(query: string, params?: any[]): Promise<any> {
    try {
      return await this.provider.executeRawQuery(query, params);
    } catch (error) {
      logger.error(`Error executing raw query on ${this.dbType}`, { error, query, params });
      throw error;
    }
  }

  /**
   * Get database configuration from environment variables
   * @param dbType - The type of database
   */
  private getConfigFromEnv(dbType: DatabaseType): DatabaseConfig {
    switch (dbType) {
      case 'mongodb':
        return {
          uri: config.mongodb.uri,
          user: config.mongodb.user,
          pass: config.mongodb.pass,
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        };
      // Future implementations
      case 'postgres':
      case 'mysql':
        throw new Error(`Configuration for ${dbType} not yet implemented`);
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

// Create a default database service instance
export const dbService = new DatabaseService(); 