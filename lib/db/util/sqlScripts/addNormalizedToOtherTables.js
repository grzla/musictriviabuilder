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

// Queries to add normalized columns to each table
const queries = [
  // Add to usedsongs table
  `ALTER TABLE usedsongs
  ADD COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(artist,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '\\\\s*(f\\.?|ft\\.?|feat\\.?|featuring|and|&).*$', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(title,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '^(A |The |An )|\\\\s*\\\\(.*\\\\)', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD INDEX idx_normalized (normalized_artist, normalized_title)`,

  // Add to donotplay table
  `ALTER TABLE donotplay
  ADD COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(artist,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '\\\\s*(f\\.?|ft\\.?|feat\\.?|featuring|and|&).*$', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(title,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '^(A |The |An )|\\\\s*\\\\(.*\\\\)', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD INDEX idx_normalized (normalized_artist, normalized_title)`,

  // Add to requests table
  `ALTER TABLE requests
  ADD COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(artist,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '\\\\s*(f\\.?|ft\\.?|feat\\.?|featuring|and|&).*$', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
      TRIM(
          LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(
                          REGEXP_REPLACE(
                              REGEXP_REPLACE(title,
                                  ',\\\\s*(The|A)\\\\s*$', ''
                              ),
                              '[\'']', ''
                          ),
                          '^(A |The |An )|\\\\s*\\\\(.*\\\\)', ''
                      ),
                      '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                  ),
                  '\\\\s+', ' '
              )
          )
      )
  ) STORED,
  ADD INDEX idx_normalized (normalized_artist, normalized_title)`
];

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
