import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from "mysql2";
import { composeQuery } from "@/lib/actions/song.actions";
/*
Get 10 random songs from the billboardsongs table.
2 from pre 1980s (<1980), 2 from 1980-1989, 2 from 1990-1999, 2 from 2000-2009, 2 from post aughts (>2009)
*/
export async function GET() {
    let connection: PoolConnection | null = null;
    try {
      connection = await connectToSql();
      
      // select 10 songs from billboard which are not in usedsongs or donotplay
        const queries = [
            composeQuery(1970),
            composeQuery(1970),
            composeQuery(1980),
            composeQuery(1980),
            composeQuery(1990),
            composeQuery(1990),
            composeQuery(2000),
            composeQuery(2000),
            composeQuery(2010),
            composeQuery(2010)
        ];
      
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
          ranking: row.ranking,
          inLibrary: null,
          gameNum: null,
          gameCat: null,
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
