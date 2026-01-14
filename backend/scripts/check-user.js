const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('ssl=true') ? { rejectUnauthorized: false } : false
});

async function checkUser() {
  try {
    // Check if user $ exists
    const result = await pool.query(
      "SELECT id, username, email, uid, is_verified, role FROM users WHERE username = '$'"
    );
    
    console.log('User $ query result:', result.rows);
    
    // Also check all users
    const allUsers = await pool.query("SELECT id, username, uid, is_verified, role FROM users ORDER BY uid");
    console.log('\nAll users:', allUsers.rows);
    
    // Check profiles
    const profiles = await pool.query("SELECT p.id, p.user_id, u.username FROM profiles p JOIN users u ON p.user_id = u.id");
    console.log('\nProfiles:', profiles.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
