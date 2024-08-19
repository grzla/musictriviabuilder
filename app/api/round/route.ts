'use server'
import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from "mysql2";

/*
Get 10 random songs from the billboardsongs table.
2 from pre 1980s (<1980), 2 from 1980-1989, 2 from 1990-1999, 2 from 2000-2009, 2 from post aughts (>2009)
*/
export async function GET() {
    let connection: PoolConnection | null = null;
    try {
      connection = await connectToSql();
      /* original query
      const queries = [
        "SELECT * FROM billboardsongs WHERE year < 1980 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 1980 AND year < 1990 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 1990 AND year < 2000 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 2000 AND year < 2010 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 2010 ORDER BY RAND() LIMIT 2"
      ];
      */
  // /*
  // select 10 songs from billboard which are not in usedsongs or donotplay
      const queries = [
        `SELECT * FROM billboardsongs 
         WHERE year < 1980 
         AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
         AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
         ORDER BY RAND() LIMIT 2`,
        `SELECT * FROM billboardsongs 
         WHERE year >= 1980 AND year < 1990 
         AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
         AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
         ORDER BY RAND() LIMIT 2`,
        `SELECT * FROM billboardsongs 
         WHERE year >= 1990 AND year < 2000 
         AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
         AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
         ORDER BY RAND() LIMIT 2`,
        `SELECT * FROM billboardsongs 
         WHERE year >= 2000 AND year < 2010 
         AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
         AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
         ORDER BY RAND() LIMIT 2`,
        `SELECT * FROM billboardsongs 
         WHERE year >= 2010 
         AND NOT EXISTS (SELECT 1 FROM usedsongs WHERE usedsongs.Artist = billboardsongs.Artist AND usedsongs.Title = billboardsongs.Title) 
         AND NOT EXISTS (SELECT 1 FROM donotplay WHERE donotplay.Artist = billboardsongs.Artist AND donotplay.Title = billboardsongs.Title) 
         ORDER BY RAND() LIMIT 2`
      ];
      // */
      
      const results = await Promise.all(queries.map(query => 
        connection!.execute<RowDataPacket[]>(query)
      ));
  
      const songs: SongParams[] = results.flatMap(([rows]) => 
        rows.map(row => ({
          id: row.id,
          title: row.title,
          artist: row.artist,
          year: row.year,
          releaseYear: null,
          ranking: row.ranking
        }))
      );
  
      return NextResponse.json(songs);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    } finally {
      if (connection) {
          connection.release();
      }
    }
  }

/*
export async function GET() {
    let connection: any;
    try {
        console.log('Connecting to the database...');
        connection = await connectToSql();
        console.log('Connected to the database.');

        const queries = [
            "SELECT * FROM billboardsongs WHERE year < 1980 ORDER BY RAND() LIMIT 2",
            "SELECT * FROM billboardsongs WHERE year >= 1980 AND year < 1990 ORDER BY RAND() LIMIT 2",
            "SELECT * FROM billboardsongs WHERE year >= 1990 AND year < 2000 ORDER BY RAND() LIMIT 2",
            "SELECT * FROM billboardsongs WHERE year >= 2000 AND year < 2010 ORDER BY RAND() LIMIT 2",
            "SELECT * FROM billboardsongs WHERE year >= 2010 ORDER BY RAND() LIMIT 2"
        ];

        console.log('Executing queries...');
        const results = await Promise.all(queries.map(query => connection.query(query)))
        console.log('Queries executed successfully.');

        const songs = results.flatMap(result => result);
        console.log(`Fetched songs: ${JSON.stringify(songs)}`);


        return NextResponse.json(songs, { status: 200 });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            console.log('Closing connection...');
            // await connection.end();
            console.log('Connection closed.');
        }
    }
}
    */