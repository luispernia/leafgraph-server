/**
 * Interface defining the common operations that all database providers must implement
 */
export interface DatabaseProvider {
  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Check if connected to the database
   */
  isConnected(): boolean;
  
  /**
   * Get the native database connection/client
   */
  getConnection(): any;
  
  /**
   * Execute a raw query
   */
  executeRawQuery(query: string, params?: any[]): Promise<any>;
}

/**
 * Interface for connection status events
 */
export interface ConnectionEvent {
  type: 'connected' | 'disconnected' | 'error';
  timestamp: Date;
  message?: string;
}

/**
 * Interface defining the database configuration
 */
export interface DatabaseConfig {
  uri: string;
  user?: string;
  pass?: string;
  options?: Record<string, any>;
} 