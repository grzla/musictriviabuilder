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

const queryCreateBillboardTable = `
CREATE TABLE billboardsongs (
  id INT AUTO_INCREMENT,
  ranking SMALLINT,
  artist VARCHAR(255),
  title VARCHAR(255),
  year SMALLINT,
  decade_year INT GENERATED ALWAYS AS (
    CASE 
      WHEN year < 1980 THEN 1970
      WHEN year BETWEEN 1980 AND 1989 THEN 1980
      WHEN year BETWEEN 1990 AND 1999 THEN 1990
      WHEN year BETWEEN 2000 AND 2009 THEN 2000
      ELSE 2010
    END
  ) STORED,
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
  INDEX idx_year_decade (decade_year),
  INDEX idx_normalized (normalized_artist, normalized_title)
);`;

const queryDropBillboardTable = `DROP TABLE IF EXISTS billboardsongs;`;

const submitQuery = query => connection.query(query, (err, result) => {
  if (err) throw err;
  console.log('Query executed successfully.');
});

// Drop existing table if it exists
submitQuery(queryDropBillboardTable);

// Create new table with normalization
submitQuery(queryCreateBillboardTable);

// Close connection
connection.end();
