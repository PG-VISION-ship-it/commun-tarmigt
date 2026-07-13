require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@commune-tarmigt.ma', hash, 'Administrateur', 'admin']
    );
    console.log('Admin user created successfully (username: admin, password: admin123)');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists.');
    } else {
      console.error('Error creating admin user:', err.message);
    }
  } finally {
    process.exit();
  }
}

seedAdmin();
