import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise'; // Import the PoolConnection type

export async function POST(req: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
        connection = await connectToSql();

        const body = await req.json();
        const { song }: { song: SongParams } = body;
        const { artist, title } = song;

        if (!artist || !title) {
            return NextResponse.json({ error: 'Artist and title are required' }, { status: 400 });
        }

        const query = 'INSERT INTO donotplay (artist, title) VALUES (?, ?)';
        const [results] = await connection.query(query, [artist, title]);

        const songs = results;
        // console.log(`Fetched songs: ${JSON.stringify(songs)}`);

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