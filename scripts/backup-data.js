#!/usr/bin/env node

/**
 * Backup Data Script
 * 
 * Usage: npm run backup
 * 
 * Creates a backup of all sales and inventory data
 * Stores as JSON file with timestamp
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const LOG_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[BACKUP_DIR, LOG_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const logFile = path.join(LOG_DIR, 'backup.log');

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}`;
  console.log(logLine);
  fs.appendFileSync(logFile, logLine + '\n');
}

async function createBackup() {
  try {
    log('INFO', 'Starting backup...');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const backupFile = path.join(BACKUP_DIR, `${timestamp}-backup.json`);
    
    // TODO: Query database or read local data
    const backup = {
      timestamp: new Date().toISOString(),
      sales: [],      // TODO: Fetch from database
      inventory: [],  // TODO: Fetch from database
      metadata: {
        salesCount: 0,
        inventoryCount: 0
      }
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    log('INFO', `Backup created: ${backupFile}`);
    log('INFO', `Sales records: ${backup.metadata.salesCount}`);
    log('INFO', `Inventory items: ${backup.metadata.inventoryCount}`);
    
    // Clean up old backups (keep last 30 days)
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    fs.readdirSync(BACKUP_DIR).forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      
      if (stat.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        log('INFO', `Deleted old backup: ${file}`);
      }
    });
    
    log('INFO', 'Backup completed successfully');
    
  } catch (error) {
    log('ERROR', `Backup failed: ${error.message}`);
    process.exit(1);
  }
}

createBackup();
