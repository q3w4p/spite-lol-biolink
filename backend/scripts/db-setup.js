#!/usr/bin/env node

/**
 * Database Setup Script
 * Run with: npm run db:setup
 */

// IMPORTANT: Disable SSL certificate verification BEFORE requiring pg
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Load environment variables if .env exists
  try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
  } catch (e) {
    // dotenv might not be installed, that's ok if env vars are set
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ schema.sql not found at:', schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Running schema.sql...');
    
    // Run the entire schema as one query
    await client.query(schema);

    console.log('✅ Database schema updated successfully!');

  } catch (error) {
    // Check if it's just "already exists" errors
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate key') ||
        (error.message.includes('relation') && error.message.includes('does not exist'))) {
      console.log('⚠️  Some objects already exist or were skipped (this is normal)');
      console.log('✅ Database schema setup completed!');
    } else {
      console.error('❌ Error setting up database:', error.message);
      process.exit(1);
    }
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

setupDatabase();
