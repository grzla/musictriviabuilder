'use server'
import { SongParams } from '@/types/index.d';
/*
takes a song parameter, returns a random song from the same decade as the song
*/

import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from 'mysql2/promise';


  
export async function GET(req: NextRequest) {
    let connection: any;
    try {
        // console.log('Connecting to the database...');
        connection = await connectToSql();
        // console.log('Connected to the database.');

        const { searchParams } = new URL(req.url);
        // const { year } = await NextRequest.json();
        console.log(`Searching the database: ${searchParams}`);
        const year: number | null = searchParams.has('year') ? Number(searchParams.get('year')) : null;

        if (year === null){
            return NextResponse.json({ error: 'No search tokens provided' }, { status: 400 });
        }

        // Calculate the start and end years of the decade
        const startYear: string = Math.floor(year / 10) * 10;
        const endYear: string = startYear + 9;

        const query =
            `SELECT * FROM billboardsongs 
             WHERE year BETWEEN ${startYear} AND ${endYear}
             AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
             AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
             ORDER BY RAND() LIMIT 1`
    

        // console.log('Executing query...');
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