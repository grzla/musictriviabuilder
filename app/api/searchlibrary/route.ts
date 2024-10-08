import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';

  
export async function GET(req: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
        connection = await connectToSql();

        const { searchParams } = new URL(req.url);
        // const { artist, title } = await NextRequest.json();
        // console.log(`Searching the database: ${searchParams}`);
        const searchTokens: string[] = searchParams.get('query')?.split(' ') || [];

        if (searchTokens.length === 0) {
            return NextResponse.json({ error: 'No search tokens provided' }, { status: 400 });
        }

        // Build the WHERE clause dynamically based on search tokens
        const whereClauses: string[] = searchTokens.map(token => {
            const escapedToken = connection!.escape(`%${token}%`);
            return `(Artist LIKE ${escapedToken} OR Title LIKE ${escapedToken} OR Year LIKE ${escapedToken})`;
        });

        const query = `
        SELECT MIN(id) as id, artist, title, year
        FROM librarysongs
        WHERE ${whereClauses.join(' AND ')}
        GROUP BY artist, title, year
        LIMIT 10;
    `;

        console.log('Executing query...');
        const [results] = await connection.query(query);
        
        // remove duplicates 
        /*
        const uniqueResults = Array.from(
            new Set(results.map((r: SongParams) => `${r.artist}|${r.title}`))
          ).map(key => {
            const [artist, title] = key.split('|');
            return results.find((r: SongParams) => r.artist === artist && r.title === title)
            .filter((r: SongParams) => r != null);;
          });
          
          const songs = uniqueResults;
        */
        
        console.log('Query executed successfully.');

        const songs = results;
        // console.log(`Fetched songs: ${JSON.stringify(songs)}`);
/*
        const songs: SongParams[] = results.map(result => ({
            id: result.id,
            artist: result.artist,
            title: result.title,
            year: result.year
        }));
*/
        return NextResponse.json(songs, { status: 200 });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
    if (connection) {
        connection.release();
    }
}
}