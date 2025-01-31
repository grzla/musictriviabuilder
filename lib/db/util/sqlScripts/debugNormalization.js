const mysql = require('mysql2/promise');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' });

// Test cases
const testCases = [
  // Test ", The" removal
  ["Beatles, The", "Help!"],
  // Test apostrophe handling
  ["O'Jays", "Love Train"],
  ["O' Jays", "Love Train"],
  ["Doin' This", "Test"],
  // Test "and" removal
  ["Earth, Wind and Fire", "September"],
  ["Hall & Oates", "Rich Girl"],
  // Test multiple rules
  ["Temptations, The", "My Girl"],
  ["Gladys Knight & The Pips", "Midnight Train to Georgia"]
];

async function runTest() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to the MySQL server.');

    // Insert test data
    for (const [artist, title] of testCases) {
      await connection.query(
        'INSERT INTO billboardsongs (artist, title) VALUES (?, ?)',
        [artist, title]
      );
      await connection.query(
        'INSERT INTO librarysongs (artist, title) VALUES (?, ?)',
        [artist, title]
      );
    }
    console.log('Test data inserted.');

    // Run the query
    const [results] = await connection.query(`
      SELECT 
          b.artist as billboard_artist,
          b.title as billboard_title,
          b.normalized_artist as billboard_normalized_artist,
          b.normalized_title as billboard_normalized_title,
          l.artist as library_artist,
          l.title as library_title,
          l.normalized_artist as library_normalized_artist,
          l.normalized_title as library_normalized_title
      FROM billboardsongs b
      JOIN librarysongs l ON 
          b.normalized_artist = l.normalized_artist AND
          b.normalized_title = l.normalized_title
      WHERE b.artist IN (?)
      ORDER BY b.artist;
    `, [testCases.map(([artist]) => artist)]);

    console.log('\nNormalization Test Results:');
    console.log('---------------------------');
    results.forEach(row => {
      console.log('Original:');
      console.log(`  Billboard: "${row.billboard_artist}" - "${row.billboard_title}"`);
      console.log(`  Library: "${row.library_artist}" - "${row.library_title}"`);
      console.log('Normalized:');
      console.log(`  Billboard: "${row.billboard_normalized_artist}" - "${row.billboard_normalized_title}"`);
      console.log(`  Library: "${row.library_normalized_artist}" - "${row.library_normalized_title}"`);
      console.log('---------------------------');
    });

    // Clean up test data
    await connection.query(
      'DELETE FROM billboardsongs WHERE artist IN (?)',
      [testCases.map(([artist]) => artist)]
    );
    await connection.query(
      'DELETE FROM librarysongs WHERE artist IN (?)',
      [testCases.map(([artist]) => artist)]
    );
    console.log('Test data cleaned up.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

runTest();
