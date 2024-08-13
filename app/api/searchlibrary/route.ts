'use server'
/*
takes artist and title in request body, returns matches from library using best available search method
*/

import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from 'mysql2/promise';

export async function GET(req: NextRequest) {
    let connection: any;
    try {
        console.log('Connecting to the database...');
        connection = await connectToSql();
        console.log('Connected to the database.');

        const { searchParams } = new URL(req.url);
        // const { artist, title } = await NextRequest.json();
        console.log(`Searching the database: ${searchParams}`);
        const searchTokens: string[] = searchParams.get('query')?.split(' ') || [];


        if (searchTokens.length === 0) {
            return NextResponse.json({ error: 'No search tokens provided' }, { status: 400 });
        }

        // Build the WHERE clause dynamically based on search tokens
        const whereClauses: string[] = searchTokens.map(token => {
            const escapedToken = connection.escape(`%${token}%`);
            return `(Artist LIKE ${escapedToken} OR Title LIKE ${escapedToken} OR Year LIKE ${escapedToken})`;
        });

        const query = `
            SELECT * FROM librarysongs
            WHERE ${whereClauses.join(' AND ')}
            LIMIT 10
        `;

        console.log('Executing query...');
        const [results] = await connection.query(query);
        console.log('Query executed successfully.');

        const songs = results;
        // console.log(`Fetched songs: ${JSON.stringify(songs)}`);

        return NextResponse.json(songs, { status: 200 });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } 
    /*
    finally {
        if (connection) {
            console.log('Closing the database connection...');
            connection.end();
            console.log('Database connection closed.');
        }
    }
        */
}