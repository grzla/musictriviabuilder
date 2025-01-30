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

const queryCreateLibrarySongsTable = `
CREATE TABLE librarysongs (
  id INT AUTO_INCREMENT,
  artist VARCHAR(255),
  title VARCHAR(255),
  year SMALLINT,
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
  PRIMARY KEY (id),
  INDEX idx_normalized (normalized_artist, normalized_title)
);`;

const queryDropLibrarySongsTable = `DROP TABLE IF EXISTS librarysongs;`;

const submitQuery = query => connection.query(query, (err, result) => {
  if (err) throw err;
  console.log('Query executed successfully.');
});

// Drop existing table if it exists
submitQuery(queryDropLibrarySongsTable);

// Create new table with normalization
submitQuery(queryCreateLibrarySongsTable);

// Close connection
connection.end();
