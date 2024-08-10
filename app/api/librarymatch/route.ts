/*
takes artist and title in request body, returns matches from library using best available search method
*/

import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let connection: any;
    try {
        console.log('Connecting to the database...');
        connection = await connectToSql();
        console.log('Connected to the database.');

        const { artist, title } = await NextRequest.json();
        console.log(`Searching for artist: ${artist}, title: ${title}`);

        const query = `SELECT * FROM library WHERE artist LIKE '%${artist}%' AND title LIKE '%${title}%'`;
        console.log('Executing query...');
        const [results] = await connection.query(query);
        console.log('Query executed successfully.');

        const songs = results;
        console.log(`Fetched songs: ${JSON.stringify(songs)}`);

        return NextResponse.json(songs, { status: 200 });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            console.log('Closing the database connection...');
            connection.end();
            console.log('Database connection closed.');
        }
    }
}