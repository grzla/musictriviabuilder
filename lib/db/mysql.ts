import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MYSQL_URI = process.env.MYSQL_URI;

if (!MYSQL_URI) {
    throw new Error('Missing MYSQL_URI');
}

const pool = mysql.createPool(MYSQL_URI);

export const connectToSql = async (): Promise<mysql.PoolConnection> => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established.');
        return connection;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Failed to establish database connection: ' + error.message);
        } else {
            throw new Error('Failed to establish database connection: Unknown error');
        }
    }
};