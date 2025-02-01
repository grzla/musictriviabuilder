import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MYSQL_URI = process.env.MYSQL_URI;

if (!MYSQL_URI) {
    throw new Error('Missing MYSQL_URI');
}

class DatabaseConnectionManager {
    private static instance: DatabaseConnectionManager;
    private pool: mysql.Pool;
    private activeConnections: number = 0;
    private readonly DEBUG = process.env.NODE_ENV === 'development';

    private constructor() {
        this.pool = mysql.createPool({
            uri: MYSQL_URI,
            connectionLimit: 10,
            queueLimit: 0,
            waitForConnections: true,
            idleTimeout: 60000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });

        // Log pool events in debug mode
        if (this.DEBUG) {
            this.pool.on('acquire', () => {
                this.activeConnections++;
                this.logPoolStats();
            });

            this.pool.on('release', () => {
                this.activeConnections--;
                this.logPoolStats();
            });

            this.pool.on('connection', () => {
                if (this.DEBUG) console.debug('New connection created in pool');
            });
        }
    }

    public static getInstance(): DatabaseConnectionManager {
        if (!DatabaseConnectionManager.instance) {
            DatabaseConnectionManager.instance = new DatabaseConnectionManager();
        }
        return DatabaseConnectionManager.instance;
    }

    private logPoolStats(): void {
        if (this.DEBUG) {
            console.debug(`Pool stats - Active connections: ${this.activeConnections}`);
        }
    }

    public async getConnection(): Promise<mysql.PoolConnection> {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get connection from pool: ${error.message}`);
            } else {
                throw new Error('Failed to get connection from pool: Unknown error');
            }
        }
    }

    public async end(): Promise<void> {
        await this.pool.end();
    }
}

// Export a singleton instance
const dbManager = DatabaseConnectionManager.getInstance();

export const connectToSql = async (): Promise<mysql.PoolConnection> => {
    return dbManager.getConnection();
};
