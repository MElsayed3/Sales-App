const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',
  database: 'SalesManagement_PG',
  password: '12341234', 
  port: 5432,
});

module.exports = pool;
