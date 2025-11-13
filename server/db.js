const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       // غيّرها حسب إعداداتك
  host: 'localhost',
  database: 'SalesManagement_PG',
  password: 'your_password', // غيّرها بكلمة مرورك
  port: 5432,
});

module.exports = pool;
