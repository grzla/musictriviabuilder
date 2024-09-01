const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const readline = require('readline');

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

async function searchDatabase(searchParams) {
    let connection = null;
    try {
        connection = await connectToSql();

        const searchTokens = searchParams.split(' ');

        if (searchTokens.length === 0) {
            throw new Error('No search tokens provided');
        }

        // Build the WHERE clause dynamically based on search tokens
        const whereClauses = searchTokens.map(token => {
            const escapedToken = connection.escape(`%${token}%`);
            return `(artist LIKE ${escapedToken} OR title LIKE ${escapedToken} OR year LIKE ${escapedToken})`;
        });

        const query = `
            SELECT MIN(id) as id, artist, title, year
            FROM librarysongs
            WHERE ${whereClauses.join(' AND ')}
            GROUP BY artist, title, year
            LIMIT 10;
        `;

        const [results] = await connection.execute(query);

        return { success: true, data: results };
    } catch (error) {
        console.error('Error searching the database:', error);
        return { success: false, error: error.message };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// CLI to accept input from the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your search query (artist - title): ', async (query) => {
    const searchParams = query.replace(' - ', ' ');
    const response = await searchDatabase(searchParams);
    console.log(response);
    rl.close();
});