/**
 * Application Constants
 * 
 * Centralized configuration values for the application
 */

// API Configuration
export const AMAZON = {
  // Default marketplace (US)
  MARKETPLACE_ID: 'ATVPDKIKX0DER',
  
  // API Regions
  REGIONS: {
    US: 'us-east-1',
    EU: 'eu-west-1',
    JP: 'ap-northeast-1'
  },
  
  // Rate Limits
  RATE_LIMITS: {
    ORDERS: 10,           // requests per second
    INVENTORY: 2,         // requests per second
    CATALOG: 1            // requests per second
  },
  
  // Sync Configuration
  SYNC: {
    ORDERS_LOOKBACK_DAYS: 30,
    INVENTORY_SYNC_BATCH_SIZE: 50,
    RETRY_MAX_ATTEMPTS: 3,
    RETRY_BACKOFF_MS: 1000
  }
};

// Application Constants
export const APP = {
  // Environment
  ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Database
  DATABASE: {
    PROVIDER: process.env.DATABASE_PROVIDER || 'supabase', // 'supabase' or 'json'
  },
  
  // Backup
  BACKUP: {
    RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    STORAGE_PATH: process.env.BACKUP_STORAGE_PATH || './backups'
  }
};

// Cron Job Schedule (cron format)
export const CRON_JOBS = {
  // Run Amazon sync daily at 2 AM UTC
  AMAZON_SYNC: process.env.SYNC_SCHEDULE || '0 2 * * *',
  
  // Run backups weekly on Sundays at 3 AM UTC
  BACKUP: '0 3 * * 0'
};

// UI Configuration
export const UI = {
  // Pagination
  ITEMS_PER_PAGE: 50,
  MAX_ITEMS_PER_PAGE: 500,
  
  // Table refresh interval (ms)
  REFRESH_INTERVAL: 300000, // 5 minutes
  
  // Currency formatting
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$'
};

// Error Messages
export const ERRORS = {
  MISSING_CREDENTIALS: 'Amazon API credentials are not configured',
  SYNC_FAILED: 'Failed to sync data from Amazon',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_ASIN: 'Invalid ASIN format',
  RATE_LIMITED: 'API rate limit exceeded - retrying',
  UNAUTHORIZED: 'Amazon API credentials are invalid'
};

// Success Messages
export const SUCCESS = {
  SYNC_COMPLETE: 'Data sync completed successfully',
  BACKUP_CREATED: 'Backup created successfully',
  DATA_UPDATED: 'Data updated successfully'
};

// Feature Flags (consider moving to database for dynamic control)
export const FEATURES = {
  ENABLE_SUPABASE: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  ENABLE_ANALYTICS: true,
  ENABLE_FORECASTING: false,
  ENABLE_NOTIFICATIONS: false
};

// Report Configuration
export const REPORTS = {
  FORMATS: ['csv', 'json', 'pdf'],
  DEFAULT_FORMAT: 'csv',
  MAX_ROWS_PER_EXPORT: 10000
};

// Validation Rules
export const VALIDATION = {
  ASIN_REGEX: /^[A-Z0-9]{10}$/,
  SKU_MAX_LENGTH: 100,
  TITLE_MAX_LENGTH: 255,
  PRICE_DECIMAL_PLACES: 2
};

export default {
  AMAZON,
  APP,
  CRON_JOBS,
  UI,
  ERRORS,
  SUCCESS,
  FEATURES,
  REPORTS,
  VALIDATION
};
