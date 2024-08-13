import { connectToSql } from '../mysql';

const testConnection = async () => {
    try {
        const connection = await connectToSql();
        console.log('Successfully connected to the database');
        connection.end(); // Close the connection after testing
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

testConnection();
