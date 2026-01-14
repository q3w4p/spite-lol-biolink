// Reset users script - deletes all users and resets UID sequence
// Run with: node scripts/reset-users.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Delete all data in order (respecting foreign keys)
    console.log('🗑️  Deleting all user data...');
    
    await client.query('DELETE FROM audit_log');
    await client.query('DELETE FROM banned_users');
    await client.query('DELETE FROM guestbook');
    await client.query('DELETE FROM images');
    await client.query('DELETE FROM analytics');
    await client.query('DELETE FROM template_favorites');
    await client.query('DELETE FROM templates');
    await client.query('DELETE FROM custom_badges');
    await client.query('DELETE FROM user_badges');
    await client.query('DELETE FROM links');
    await client.query('DELETE FROM profiles');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM verification_codes');
    await client.query('DELETE FROM users');
    
    console.log('✅ All users deleted!');
    
    // Reset the UID sequence to start at 1
    console.log('🔄 Resetting UID sequence...');
    await client.query('DROP SEQUENCE IF EXISTS user_uid_seq CASCADE');
    await client.query('CREATE SEQUENCE user_uid_seq START 1');
    
    // Also reset the users id sequence
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    
    console.log('✅ UID sequence reset to 1!');
    console.log('');
    console.log('🎉 Database reset complete!');
    console.log('   Next user to register will get UID: 1 (Owner)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetUsers();
