const mysql = require('mysql2');
const dotenv = require('dotenv')

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

const queryCreateDoNotPlaySongsTable = `
CREATE TABLE donotplay (
    id INT AUTO_INCREMENT,
    Artist VARCHAR(255),
    Title VARCHAR(255),
    PRIMARY KEY (id)
  );`


const submitQuery = query => connection.query(query, (err, result) => {
  if (err) throw err;
  console.log('Data imported successfully.');
});

submitQuery(queryCreateDoNotPlaySongsTable);