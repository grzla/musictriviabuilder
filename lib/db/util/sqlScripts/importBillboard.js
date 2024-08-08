const fs = require('fs')
const path = require ('path')
const dotenv = require('dotenv')
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
  const headers = lines[0].split('\t').slice(0); // Skip the first column
  const parsedData = lines.slice(1).map(line => {
    const values = line.split('\t').slice(1); // Skip the first column
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
const transformData = (parsedData, year) => {
  return parsedData.map(entry => ({
    ranking: entry.Ranking,
    artist: entry.Artist,
    title: entry.Title,
    year: year,
  }));
};

// Function to insert data into DB
const insertDataToDB = (data) => {
  const query = 'INSERT INTO billboardsongs (ranking, artist, title, year) VALUES ?';
  const values = data.map(entry => [entry.ranking, entry.artist, entry.title, entry.year]);
  console.log('Values to Insert:', values); // Debugging log
  connection.query(query, [values], (err, results) => {
    if (err) {
      console.error('Error inserting data into DB:', err);
      return;
    }
    console.log('Data inserted successfully:', results);
  });
};

// Function to process TSV files
const processTSVFiles = (directoryPath, testing) => {
  try {
    const files = fs.readdirSync(directoryPath);
    const tsvFiles = files.filter(file => path.extname(file) === '.tsv');
    const filesToProcess = testing ? tsvFiles.slice(0, 2) : tsvFiles;

    for (const file of filesToProcess) {
      const year = parseInt(path.basename(file, '.tsv'), 10);
      const filePath = path.join(directoryPath, file);
      const tsvData = readTSVFile(filePath);
      const parsedData = parseTSVData(tsvData);
      const transformedData = transformData(parsedData, year);
      insertDataToDB(transformedData);
    }
  } catch (error) {
    console.error('Error processing TSV files:', error);
    throw error;
  }
};

// Example usage
processTSVFiles('/home/greg/Documents/wrikMusicTrivia/import/billboard', false);