require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
    console.log('Creating admin tables...');
    const schema = fs.readFileSync(path.join(__dirname, 'admin-schema.sql'), 'utf-8');
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await pool.execute(stmt);
    }
    console.log('Tables created successfully.');

    console.log('Seeding admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    try {
      await pool.execute(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@commune-tarmigt.ma', hash, 'Administrateur', 'admin']
      );
      console.log('Admin user created (username: admin, password: admin123)');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('Admin user already exists.');
      } else {
        throw err;
      }
    }

    console.log('Setup complete!');
  } catch (err) {
    console.error('Setup error:', err.message);
  } finally {
    process.exit();
  }
}

setup();
