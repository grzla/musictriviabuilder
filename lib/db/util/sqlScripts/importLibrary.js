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
  const headers = lines[0].split('\t').map(header => header.replace('\r', ''));
  const parsedData = lines.slice(1).map(line => {
    const values = line.split('\t').map(value => value.replace('\r', ''));
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });
    return entry;
  });
  return parsedData;
};

// Function to transform parsed data
const transformData = (parsedData) => {
  return parsedData.map(entry => {
    let year = entry['Release Year'];
    if (year && year.length > 4) {
      year = year.substring(0, 4);
    }
    return {
      artist: entry['Artist'],
      title: entry['Title'],
      year: year ? parseInt(year, 10) : null,
    };
  });
};

// Function to insert data into DB
const insertDataToDB = (data) => {
  const query = 'INSERT INTO librarysongs (Artist, Title, Year) VALUES ?';
  const values = data.map(entry => [entry.artist, entry.title, entry.year]);

  console.log('Prepared Query:', query);
  console.log('Values to Insert:', values);

  // Log the query and values before inserting
  // console.log('Prepared Query:', query);
  // console.log('Values to Insert:', values);

  connection.query(query, [values], (err, results) => {
    if (err) {
      console.error('Error inserting data into DB:', err);
      return;
    }
    console.log('Data inserted successfully:', results.affectedRows);
  });
  // run cleanup queries
  // delete from librarysongs where artist like '%Audio Round';
  // delete from librarysongs where artist=Name That Tune';

  // make fulltext
  //   ALTER TABLE librarysongs
  // ADD FULLTEXT ft_artist_title (artist, title);

  // OR tokenize artist and title for consistency with billboardsongs
  // remove the
  // remove anything after feat/variants


};

// Function to process TSV file
const processTSVFile = (filePath) => {
  try {
    console.log(`Processing file: ${filePath}`);
    const tsvData = readTSVFile(filePath);
    const parsedData = parseTSVData(tsvData).slice(0);
    console.log('Parsed Data:', parsedData);

    const transformedData = transformData(parsedData);
    console.log('Transformed Data:', transformedData);

    if (transformedData.length > 0) {
      insertDataToDB(transformedData);
    } else {
      console.log('No data to insert.');
    }
  } catch (error) {
    console.error('Error processing TSV file:', error);
  }
};

// Example usage
processTSVFile('/home/greg/Documents/wrikMusicTrivia/librarySongs.tsv');
module.exports = {
  transformData
};