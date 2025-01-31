const mysql = require('mysql2/promise');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' });

const queries = [
  // Billboard songs
  `ALTER TABLE billboardsongs
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  `ALTER TABLE billboardsongs
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  // Library songs
  `ALTER TABLE librarysongs
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  `ALTER TABLE librarysongs
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  // Used songs
  `ALTER TABLE usedsongs
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  `ALTER TABLE usedsongs
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  // Do not play songs
  `ALTER TABLE donotplay
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  `ALTER TABLE donotplay
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  // Requests
  `ALTER TABLE requests
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`,

  `ALTER TABLE requests
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (
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
  ) STORED`
];

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
