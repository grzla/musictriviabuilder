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

const queryCreateRequestsTable = `
CREATE TABLE requests (
  id INT AUTO_INCREMENT,
  artist VARCHAR(255),
  title VARCHAR(255),
  normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(artist, 
            '(f\\.?|ft\\.?|feat\\.?|featuring|and|&).*$', ''
          ),
          '[\\\\(\\\\)\\\\?\\\\/\\.\\\\[\\\\]]', ' '
        ),
        '[ ]+', ' '
      )
    )
  ) STORED,
  normalized_title VARCHAR(255) GENERATED ALWAYS AS (
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(title,
              '^(a |the |an )|\\\\(.*\\\\)', ''
            ),
            '[\\\\(\\\\)\\\\?\\\\/\\.\\\\[\\\\]]', ' '
          ),
          '[ ]+', ' '
        ),
        ',[ ]*$', ''
      )
    )
  ) STORED,
  requestedBy VARCHAR(100),
  requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_normalized (normalized_artist, normalized_title),
  INDEX idx_requested (requestedBy, requestedAt)
);`;

const queryDropRequestsTable = `DROP TABLE IF EXISTS requests;`;

const submitQuery = query => connection.query(query, (err, result) => {
  if (err) throw err;
  console.log('Query executed successfully.');
});

// Drop existing table if it exists
submitQuery(queryDropRequestsTable);

// Create new table with normalization
submitQuery(queryCreateRequestsTable);

// Close connection
connection.end();
