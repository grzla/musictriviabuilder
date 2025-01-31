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
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const round = searchParams.get('round');
    
    if (!round) {
        return NextResponse.json({ error: 'Round parameter is required' }, { status: 400 });
    }
    let connection: PoolConnection | null = null;
    try {
      connection = await connectToSql();
      
      // Base query for both rounds
      let baseQuery = `
        WITH RECURSIVE ${round === 'decades' ? `
          decades AS (
            SELECT 1970 as decade, 2 as count UNION ALL
            SELECT 1980, 2 UNION ALL
            SELECT 1990, 2 UNION ALL
            SELECT 2000, 2 UNION ALL
            SELECT 2010, 2
          ),` : ''} available_songs AS (
          SELECT b.*
          ${round === 'decades' ? `, 
            CASE 
              WHEN b.year < 1980 THEN 1970
              WHEN b.year BETWEEN 1980 AND 1989 THEN 1980
              WHEN b.year BETWEEN 1990 AND 1999 THEN 1990
              WHEN b.year BETWEEN 2000 AND 2009 THEN 2000
              ELSE 2010
            END as decade` : ''}
          FROM billboardsongs b
          WHERE NOT EXISTS (
            SELECT 1 FROM usedsongs u 
            WHERE u.normalized_artist = b.normalized_artist 
            AND u.normalized_title = b.normalized_title
          )
          AND NOT EXISTS (
            SELECT 1 FROM donotplay d
            WHERE d.normalized_artist = b.normalized_artist 
            AND d.normalized_title = b.normalized_title
          )
          AND NOT EXISTS (
            SELECT 1 FROM requests r
            WHERE r.normalized_artist = b.normalized_artist 
            AND r.normalized_title = b.normalized_title
          )
        ),
        random_songs AS (
          ${round === 'decades' ? `
            SELECT a.*,
              ROW_NUMBER() OVER (PARTITION BY a.decade ORDER BY RAND()) as rn
            FROM available_songs a
            JOIN decades d ON a.decade = d.decade
          ` : `
            SELECT a.*,
              ROW_NUMBER() OVER (ORDER BY RAND()) as rn
            FROM available_songs a
          `}
        )
        SELECT id, title, artist, year, ranking
        FROM random_songs
        WHERE rn <= ${round === 'decades' ? '2' : '10'}
        ${round === 'decades' ? 'ORDER BY decade, RAND()' : 'ORDER BY RAND()'}
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(baseQuery);
      
      const songs: SongParams[] = rows.map(row => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        year: row.year,
        releaseYear: null,
        ranking: row.ranking,
        inLibrary: null,
        gameNum: null,
        gameCat: null
      }));
  
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
