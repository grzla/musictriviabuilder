const mysql = require('mysql2');
const dotenv = require('dotenv');
const { generateAddNormalizedColumns } = require('./normalizationRules');

dotenv.config({ path: '.env.local' });

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');
});

// Tables that need normalized columns
const tables = ['usedsongs', 'donotplay', 'requests'];

// Generate queries for each table
const queries = tables.map(table => generateAddNormalizedColumns(table));

// Execute each query sequentially
const executeQueries = async (queries) => {
  for (const query of queries) {
    try {
      await connection.promise().query(query);
      console.log('Successfully executed query.');
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  }
};

// Run the queries and close connection
executeQueries(queries)
  .then(() => {
    console.log('All normalized columns added successfully.');
    connection.end();
  })
  .catch(err => {
    console.error('Failed to add normalized columns:', err);
    connection.end();
  });
