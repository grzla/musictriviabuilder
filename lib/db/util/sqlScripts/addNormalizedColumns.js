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

const queryAddNormalizedColumns = generateAddNormalizedColumns('billboardsongs');

// Execute the alter table query
connection.query(queryAddNormalizedColumns, (err, result) => {
  if (err) throw err;
  console.log('Normalized columns added successfully to billboard songs table.');
  connection.end();
});
