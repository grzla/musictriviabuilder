// 8/19 this is currently broken.
// must've overwritten the parsing of the billboard folders

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config({ path: '.env.local' });

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL server:', err);
    return;
  }
  console.log('Connected to the MySQL server.');
});

// Function to read TSV file
const readTSVFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

// Function to parse TSV data
const parseTSVData = (data) => {
  const lines = data.trim().split('\n');
  const headers = lines[0].split('\t');
  const parsedData = lines.slice(1).map(line => {
    const values = line.split('\t');
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });
    console.dir(entry); // Debugging log
    return entry;
  });
  console.log('Parsed Data:', parsedData); // Debugging log
  return parsedData;
};

// Function to transform parsed data
const transformData = (parsedData) => {
  return parsedData.map(entry => ({
    artist: entry['Artist'],
    title: entry['Title'],
    year: entry['Release Year'] ? parseInt(entry['Release Year'], 10) : null,
  }));
};

// Function to insert data into DB
const insertDataToDB = (data) => {
  const query = 'INSERT INTO librarysongs (Artist, Title, Year) VALUES ?';
  const values = data.map(entry => [entry.artist, entry.title, entry.year]);
  console.log('Values to Insert:', values); // Debugging log
  connection.query(query, [values], (err, results) => {
    if (err) {
      console.error('Error inserting data into DB:', err);
      return;
    }
    console.log('Data inserted successfully:', results);
  });
};

// Function to process TSV file
const processTSVFile = (filePath) => {
  try {
    const tsvData = readTSVFile(filePath);
    const parsedData = parseTSVData(tsvData);
    const transformedData = transformData(parsedData);
    insertDataToDB(transformedData);
  } catch (error) {
    console.error('Error processing TSV file:', error);
    throw error;
  }
};

// Example usage
processTSVFile('/home/greg/Documents/wrikMusicTrivia/librarySongs.tsv');
