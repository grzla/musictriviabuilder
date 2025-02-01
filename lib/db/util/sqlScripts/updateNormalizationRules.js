const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { generateUpdateNormalizedColumns } = require('./normalizationRules');

dotenv.config({ path: '.env.local' });

// Tables that need normalization rules updated
const tables = [
  'billboardsongs',
  'librarysongs',
  'usedsongs',
  'donotplay',
  'requests'
];

// Generate all queries for each table
const queries = tables.flatMap(table => generateUpdateNormalizedColumns(table));

async function updateNormalization() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to the MySQL server.');
    
    for (const query of queries) {
      await connection.query(query);
      console.log('Successfully executed query.');
    }
    
    console.log('All normalization rules updated successfully.');
  } catch (err) {
    console.error('Error updating normalization rules:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

updateNormalization().catch(console.error);
