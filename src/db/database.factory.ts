import { DatabaseProvider, DatabaseConfig } from './interfaces/database.interface';
import { MongoDBProvider } from './providers/mongodb.provider';
import logger from '../utils/logger';

/**
 * Supported database types
 */
export type DatabaseType = 'mongodb' | 'postgres' | 'mysql';

/**
 * Factory class for creating database providers
 */
export class DatabaseFactory {
  private static providers: Map<string, DatabaseProvider> = new Map();

  /**
   * Create a database provider of the specified type
   * @param type - The type of database provider to create
   * @param config - The database configuration
   * @returns The created database provider
   */
  static createProvider(type: DatabaseType, config: DatabaseConfig): DatabaseProvider {
    // Check if provider already exists
    const existingProvider = this.providers.get(type);
    if (existingProvider) {
      logger.info(`Reusing existing ${type} database provider`);
      return existingProvider;
    }

    // Create a new provider based on the type
    let provider: DatabaseProvider;
    
    switch (type) {
      case 'mongodb':
        provider = new MongoDBProvider(config);
        break;
      // Future implementations
      case 'postgres':
      case 'mysql':
        throw new Error(`Database provider for ${type} not yet implemented`);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }

    // Store the provider for reuse
    this.providers.set(type, provider);
    logger.info(`Created new ${type} database provider`);
    
    return provider;
  }

  /**
   * Get an existing database provider
   * @param type - The type of database provider to get
   * @returns The database provider or undefined if not found
   */
  static getProvider(type: DatabaseType): DatabaseProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Close all database connections
   */
  static async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    
    for (const [type, provider] of this.providers.entries()) {
      logger.info(`Closing ${type} database connection`);
      closePromises.push(provider.disconnect());
    }
    
    await Promise.all(closePromises);
    this.providers.clear();
    logger.info('All database connections closed');
  }
} 