const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    const result = await pool.query("SELECT id, username, email, is_verified, uid FROM users WHERE username = '$'");
    console.log('User with username $:', result.rows);
    
    const allUsers = await pool.query("SELECT id, username, email, is_verified, uid FROM users LIMIT 10");
    console.log('All users:', allUsers.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}
checkUser();
