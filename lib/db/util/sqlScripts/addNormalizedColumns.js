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

const queryAddNormalizedColumns = `
ALTER TABLE billboardsongs
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
ADD INDEX idx_normalized (normalized_artist, normalized_title);`;

// Execute the alter table query
connection.query(queryAddNormalizedColumns, (err, result) => {
  if (err) throw err;
  console.log('Normalized columns added successfully to billboard songs table.');
  connection.end();
});
