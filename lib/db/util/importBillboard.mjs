import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { connectToDatabase } from '../mongoose';
import Song from '../models/song.model';

// Constants
const DIRECTORY_PATH = '/home/greg/Documents/wrikMusicTrivia/import/billboard';
const TESTING = true; // Set this to false to process all files
const NOT_PLAYED = '0';
const PLAYED = 'played';
const NOT_PLAYED_STATUS = 'not played';

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
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

// Function to generate hash
const generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Function to transform parsed data
const transformData = (parsedData, year) => {
  return parsedData.map((entry, index) => ({
    id: `${entry.Artist}-${entry.Title}-${year}`,
    artist: entry.Artist,
    title: entry.Title,
    year: year,
    rank: parseInt(entry.Ranking, 10),
    releaseYear: year,
    status: entry.Played === NOT_PLAYED ? NOT_PLAYED_STATUS : PLAYED,
    datePlayed: entry.Played === NOT_PLAYED ? null : new Date(),
    normalizedArtist: entry.Artist.toLowerCase().replace(/\s+/g, ''),
    normalizedTitle: entry.Title.toLowerCase().replace(/\s+/g, ''),
    hash: generateHash(`${entry.Artist}-${entry.Title}-${year}`)
  }));
};

// Function to insert data into DB
const insertDataToDB = async (data) => {
  try {
    await Song.insertMany(data);
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    throw error;
  }
};

// Function to process TSV files
const processTSVFiles = async (directoryPath, testing) => {
  try {
    const files = fs.readdirSync(directoryPath);
    const tsvFiles = files.filter(file => path.extname(file) === '.tsv');
    const filesToProcess = testing ? tsvFiles.slice(0, 1) : tsvFiles;

    for (const file of filesToProcess) {
      const year = parseInt(path.basename(file, '.tsv'), 10);
      const filePath = path.join(directoryPath, file);
      const tsvData = readTSVFile(filePath);
      const parsedData = parseTSVData(tsvData);
      const transformedData = transformData(parsedData, year);
      await insertDataToDB(transformedData);
    }
  } catch (error) {
    console.error('Error processing TSV files:', error);
    throw error;
  }
};

// Main function to connect to MongoDB and process files
const main = async () => {
  try {
    const mongoose = await connectToDatabase();
    console.log('Connected to MongoDB');
    await processTSVFiles(DIRECTORY_PATH, TESTING);
    console.log('Data import completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error connecting to MongoDB or processing files:', error);
  }
};

main().catch(console.error);