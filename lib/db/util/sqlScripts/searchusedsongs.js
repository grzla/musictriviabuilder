import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

async function connectToSql() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    console.log('Connected to the MySQL server.');
    return connection;
}

async function getRandomSongs() {
    let connection = null;
    try {
        connection = await connectToSql();

        const queries = [
            `SELECT * FROM billboardsongs 
             WHERE year < 1980 
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM requests WHERE requests.Artist = billboardsongs.Artist AND requests.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 2`,
            `SELECT * FROM billboardsongs 
             WHERE year >= 1980 AND year < 1990 
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM requests WHERE requests.Artist = billboardsongs.Artist AND requests.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 2`,
            `SELECT * FROM billboardsongs 
             WHERE year >= 1990 AND year < 2000 
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM requests WHERE requests.Artist = billboardsongs.Artist AND requests.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 2`,
            `SELECT * FROM billboardsongs 
             WHERE year >= 2000 AND year < 2010 
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM requests WHERE requests.Artist = billboardsongs.Artist AND requests.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 2`,
            `SELECT * FROM billboardsongs 
             WHERE year >= 2010 
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM requests WHERE requests.Artist = billboardsongs.Artist AND requests.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 2`
        ];

        const results = [];
        for (const query of queries) {
            const [rows] = await connection.execute(query);
            results.push(...rows);
        }

        return { success: true, data: results };
    } catch (error) {
        console.error('Error fetching random songs:', error);
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// CLI to call the function from the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Press Enter to fetch random songs: ', async () => {
    const response = await getRandomSongs();
    console.log(response);
    rl.close();
});

