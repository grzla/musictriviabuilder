import { NextRequest, NextResponse } from 'next/server';
import { connectToSql } from "@/lib/db/mysql";
import { RowDataPacket } from "mysql2";
import { SongParams } from "@/types/index"; // Adjust the import path as necessary

/*
Get 10 random songs from the billboardsongs table.
2 from pre 1980s (<1980), 2 from 1980-1989, 2 from 1990-1999, 2 from 2000-2009, 2 from post aughts (>2009)
*/
export async function GET() {
    try {
      const connection = await connectToSql();
      
      const queries = [
        "SELECT * FROM billboardsongs WHERE year < 1980 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 1980 AND year < 1990 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 1990 AND year < 2000 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 2000 AND year < 2010 ORDER BY RAND() LIMIT 2",
        "SELECT * FROM billboardsongs WHERE year >= 2010 ORDER BY RAND() LIMIT 2"
      ];
  
      const results = await Promise.all(queries.map(query => 
        connection.execute<RowDataPacket[]>(query)
      ));
  
      const songs: SongParams[] = results.flatMap(([rows]) => 
        rows.map(row => ({
          title: row.Title,
          artist: row.Artist,
          year: row.Year
        }))
      );
  
      return NextResponse.json(songs);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
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