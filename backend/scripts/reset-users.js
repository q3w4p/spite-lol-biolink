// Reset users script - deletes all users and resets UID sequence
// Run with: npm run reset-users

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function safeDelete(client, table) {
  try {
    await client.query(`DELETE FROM ${table}`);
    console.log(`  ✓ Cleared ${table}`);
  } catch (error) {
    if (error.code === '42P01') {
      console.log(`  - Table ${table} doesn't exist, skipping`);
    } else {
      console.log(`  ⚠ Warning on ${table}: ${error.message}`);
    }
  }
}

async function resetUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connecting to database...');
    console.log('✅ Connected!\n');
    
    console.log('🗑️  Deleting all user data...');
    
    // Delete in order to respect foreign key constraints
    await safeDelete(client, 'audit_log');
    await safeDelete(client, 'banned_users');
    await safeDelete(client, 'guestbook');
    await safeDelete(client, 'images');
    await safeDelete(client, 'analytics');
    await safeDelete(client, 'template_favorites');
    await safeDelete(client, 'templates');
    await safeDelete(client, 'custom_badges');
    await safeDelete(client, 'user_badges');
    await safeDelete(client, 'links');
    await safeDelete(client, 'profiles');
    await safeDelete(client, 'password_reset_tokens');
    await safeDelete(client, 'sessions');
    await safeDelete(client, 'verification_codes');
    await safeDelete(client, 'users');
    
    console.log('\n🔄 Resetting UID sequence...');
    
    // Reset the UID sequence to start at 1
    try {
      await client.query('DROP SEQUENCE IF EXISTS user_uid_seq CASCADE');
      await client.query('CREATE SEQUENCE user_uid_seq START 1');
      console.log('  ✓ UID sequence reset to 1');
    } catch (error) {
      console.log(`  ⚠ Sequence warning: ${error.message}`);
    }
    
    // Also reset the users id sequence
    try {
      await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      console.log('  ✓ Users ID sequence reset');
    } catch (error) {
      console.log(`  - Users ID sequence: ${error.message}`);
    }
    
    console.log('\n🎉 Database reset complete!');
    console.log('   Next user to register will get UID: 1 (Owner)\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetUsers();
