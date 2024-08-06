import fs from 'fs';
import path from 'path';
import { SongParams } from '@/types';
import { connectToDatabase } from '../mongoose';
import Song from '../models/song.model';
import dotenv from 'dotenv';
import { getHashFunctions, minhashSignature } from '../hash';

dotenv.config({ path: '.env.local' });

// Constants
const DIRECTORY_PATH = '/home/greg/Documents/wrikMusicTrivia/import/test';
const TESTING = true; // Set this to false to process all files
const NUM_HASH_FUNCTIONS = 100; // Number of hash functions for MinHash

// Function to read TSV file
const readTSVFile = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

// Function to parse TSV data
export const parseTSVData = (tsvData: string): Array<{ Ranking: number, Artist: string, Title: string }> => {
  const lines = tsvData.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split('\t');
  const rankingIndex = headers.indexOf('Ranking');
  const artistIndex = headers.indexOf('Artist');
  const titleIndex = headers.indexOf('Title');

  console.log(`Total lines: ${lines.length}`);
  return lines.slice(1).map(line => {
    const columns = line.split('\t');
    return {
      Ranking: parseInt(columns[rankingIndex], 10),
      Artist: columns[artistIndex],
      Title: columns[titleIndex]
    };
  });
};

// Function to generate MinHash signature
const generateMinHashSignature = (artist: string, title: string): number[] => {
  const tokens = new Set((artist + " " + title).toLowerCase().split(' '));
  const hashFunctions = getHashFunctions(NUM_HASH_FUNCTIONS);
  return minhashSignature(tokens, hashFunctions);
};

// Function to transform parsed data
const transformData = (parsedData: any[], year: number): SongParams[] => {
  return parsedData.map((entry, index) => ({
    artist: entry.Artist,
    title: entry.Title,
    year: year,
    rank: parseInt(entry.Ranking, 10),
    releaseYear: null,
    status: null,
    datePlayed: null,
    normalizedArtist: entry.Artist.toLowerCase().replace(/\s+/g, ''),
    normalizedTitle: entry.Title.toLowerCase().replace(/\s+/g, ''),
    hash: generateMinHashSignature(entry.Artist, entry.Title)
  }));
};

// Function to insert data into DB
const insertDataToDB = async (data: SongParams[]): Promise<void> => {
  try {
    await Song.insertMany(data);
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    throw error;
  }
};

// Function to process TSV files
const processTSVFiles = async (directoryPath: string, testing: boolean): Promise<void> => {
  try {
    const files = fs.readdirSync(directoryPath);
    const tsvFiles = files.filter(file => path.extname(file) === '.tsv');
    const filesToProcess = testing ? tsvFiles.slice(0, 1) : tsvFiles;

    for (const file of filesToProcess) {
      const year = parseInt(path.basename(file, '.tsv'), 10);
      const filePath = path.join(directoryPath, file);
      const tsvData = readTSVFile(filePath);
      console.log(`File: ${file}, Year: ${year}`);
      console.log(`TSV Data: ${tsvData}`);

      const parsedData = parseTSVData(tsvData);
      console.log(`Parsed Data Length: ${parsedData.length}`);
      if (parsedData.length > 0) {
        console.dir(parsedData[parsedData.length - 2], { depth: null, colors: true });
      }

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