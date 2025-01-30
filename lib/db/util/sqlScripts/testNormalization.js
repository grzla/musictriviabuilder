const mysql = require('mysql2/promise');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' });

async function testNormalization() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Create temporary test table
        await connection.execute(`
            CREATE TEMPORARY TABLE normalization_test (
                id INT AUTO_INCREMENT,
                artist VARCHAR(255),
                title VARCHAR(255),
                normalized_artist VARCHAR(255) GENERATED ALWAYS AS (
                    LOWER(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(artist, 
                                    '\\\\b(f\\.?|ft\\.?|feat\\.?|featuring|and|&)\\\\b.*$', ''
                                ),
                                '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                            ),
                            '\\\\s+', ' '
                        )
                    )
                ) STORED,
                normalized_title VARCHAR(255) GENERATED ALWAYS AS (
                    LOWER(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(
                                    REGEXP_REPLACE(title,
                                        '^(A |The |An )|\\\\s*\\\\(.*\\\\)', ''
                                    ),
                                    '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                                ),
                                '\\\\s+', ' '
                            ),
                            ',$', ''
                        )
                    )
                ) STORED,
                PRIMARY KEY (id)
            )
        `);

        // Insert test cases from searchmismatch
        await connection.execute(`
            INSERT INTO normalization_test (artist, title)
            SELECT artist, title FROM searchmismatch
        `);

        // Test normalization results
        const [rows] = await connection.execute(`
            SELECT 
                artist as original_artist,
                title as original_title,
                normalized_artist,
                normalized_title,
                EXISTS (
                    SELECT 1 
                    FROM librarysongs l 
                    WHERE l.normalized_artist = normalization_test.normalized_artist
                    AND l.normalized_title = normalization_test.normalized_title
                ) as found_in_library
            FROM normalization_test
        `);

        console.log('Normalization Test Results:');
        console.log('---------------------------');
        rows.forEach(row => {
            console.log(`\nOriginal Artist: ${row.original_artist}`);
            console.log(`Normalized Artist: ${row.normalized_artist}`);
            console.log(`Original Title: ${row.original_title}`);
            console.log(`Normalized Title: ${row.normalized_title}`);
            console.log(`Found in Library: ${row.found_in_library ? 'Yes' : 'No'}`);
            console.log('---------------------------');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

testNormalization().catch(console.error);
