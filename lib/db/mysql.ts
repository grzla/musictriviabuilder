import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config({ path: '.env.local' });

const MYSQL_URI = process.env.MYSQL_URI;

interface MySQLConnection {
    conn: mysql.Connection | null;
    promise: Promise<mysql.Connection> | null;
}

let cached: MySQLConnection = (global as any).mysql;

if (!cached) {
    cached = (global as any).mysql = { conn: null, promise: null };
}

export const connectToSql = async (): Promise<mysql.Connection> => {
    if (cached.conn) {
        console.log('Using cached database connection.');
        return cached.conn;
    }

    if (!MYSQL_URI) throw new Error('Missing MYSQL_URI');

    if (!cached.promise) {
        console.log('Creating new database connection...');
        cached.promise = mysql.createConnection(MYSQL_URI);
    }

    cached.conn = await cached.promise;
    console.log('Database connection established.');
    return cached.conn;
};