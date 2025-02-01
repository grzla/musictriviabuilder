import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { composeQuery } from "@/lib/db/queries";


export async function GET(req: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
        connection = await connectToSql();
        // console.log('Connected to the database.');

        const { searchParams } = new URL(req.url);
        console.log(`Searching the database: ${searchParams}`);
        const year: number | null = searchParams.has('year') ? Number(searchParams.get('year')) : null;
        const libraryOnly: boolean = searchParams.has('libraryOnly') ? searchParams.get('libraryOnly') === 'true' : false;

        if (year === null) {
            return NextResponse.json({ error: 'No search tokens provided' }, { status: 400 });
        }

        const query = composeQuery(year, false, libraryOnly);
        const [results] = await connection.query<RowDataPacket[]>(query);
        
        if (!results || !Array.isArray(results) || results.length === 0) {
            return NextResponse.json({ error: 'No songs found' }, { status: 404 });
        }

        const songs = results.map(row => ({
            id: row.id,
            artist: row.artist,
            title: row.title,
            year: row.year,
            ranking: row.ranking,
            releaseYear: null,
            inLibrary: true,
            gameNum: null,
            gameCat: null
        }));

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
