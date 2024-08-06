import mongoose, {Mongoose} from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null }
}

export const connectToDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if(!MONGODB_URI) throw new Error('Missing MONGODB_URI');

    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, { 
        dbName: 'musictriviabuilder',
        bufferCommands: false, 
    })

    cached.conn = await cached.promise;
    return cached.conn;
}
