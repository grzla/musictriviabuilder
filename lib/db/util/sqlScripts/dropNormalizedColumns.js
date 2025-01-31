const mysql = require('mysql2/promise');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' });

async function dropNormalizedColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to the MySQL server.');
    
    const tables = ['billboardsongs', 'librarysongs', 'usedsongs', 'donotplay', 'requests'];
    
    for (const table of tables) {
      // Drop index first
      try {
        await connection.query(`ALTER TABLE ${table} DROP INDEX idx_normalized`);
        console.log(`Dropped index from ${table}`);
      } catch (err) {
        console.log(`No index to drop on ${table} or already dropped`);
      }

      // Drop normalized columns
      try {
        await connection.query(`
          ALTER TABLE ${table}
          DROP COLUMN normalized_artist,
          DROP COLUMN normalized_title
        `);
        console.log(`Dropped normalized columns from ${table}`);
      } catch (err) {
        console.log(`No columns to drop on ${table} or already dropped`);
      }
    }
    
    console.log('All normalized columns dropped successfully.');
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

dropNormalizedColumns().catch(console.error);
