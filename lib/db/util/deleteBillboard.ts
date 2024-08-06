import { DeleteManyModel } from './../../../node_modules/mongodb/src/bulk/common';
/*

Delete the billboard collection from the database.
*/

import { SongParams } from '@/types';
import Song from '../models/song.model';
import { connectToDatabase } from '../mongoose';
import dotenv from 'dotenv';

// dotenv.config({ path: '.env.local' });
dotenv.config();

const deleteBillboard = async (): Promise<void> => {
  try {
    const mongoose = await connectToDatabase();
    await Song.deleteMany({});
    console.log('Billboard collection deleted');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error deleting billboard collection:', error);
    throw error;
  }
};

// Main function to connect to MongoDB and process files

const main = async () => {
  try {
    // const mongoose = await connectToDatabase();
    await deleteBillboard();
    console.log('Connected to MongoDB');
    console.log('Data delete completed');
    // await mongoose.disconnect();
  } catch (error) {
    console.error('Error connecting to MongoDB or processing files:', error);
  }
};

main().catch(console.error);