import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { composeQuery } from "@/lib/actions/song.actions";


export async function GET(req: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
        connection = await connectToSql();
        // console.log('Connected to the database.');

        const { searchParams } = new URL(req.url);
        // const { year } = await NextRequest.json();
        console.log(`Searching the database: ${searchParams}`);
        const year: number | null = searchParams.has('year') ? Number(searchParams.get('year')) : null;

        if (year === null) {
            return NextResponse.json({ error: 'No search tokens provided' }, { status: 400 });
        }

        const query = composeQuery(year);


        // console.log('Executing query...');
        const [results] = await connection.query(query);



        console.log('Query executed successfully.');

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