import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from "mysql2";
import { composeQuery } from "@/lib/actions/song.actions";
/*
Get 10 random songs from the billboardsongs table.
2 from pre 1980s (1 must be from 1970s), 2 from 1980-1989, 2 from 1990-1999, 2 from 2000-2009, 2 from post aughts (>2009)
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
      
      // Base query for all rounds - ensures one 70s song and proper decade distribution
      let baseQuery = `
        WITH RECURSIVE 
          /* Define our decades and counts, with priority only for pre-1980 categories */
          decades AS (
            SELECT '1970s' as category, 1970 as decade_start, 1979 as decade_end, 1 as count, 1 as priority UNION ALL
            SELECT 'pre1980' as category, 1900 as decade_start, 1979 as decade_end, 1 as count, 2 as priority UNION ALL
            SELECT '1980s' as category, 1980 as decade_start, 1989 as decade_end, 2 as count, NULL as priority UNION ALL
            SELECT '1990s' as category, 1990 as decade_start, 1999 as decade_end, 2 as count, NULL as priority UNION ALL
            SELECT '2000s' as category, 2000 as decade_start, 2009 as decade_end, 2 as count, NULL as priority UNION ALL
            SELECT '2010s' as category, 2010 as decade_start, 2029 as decade_end, 2 as count, NULL as priority
          ),
          available_songs AS (
            SELECT b.*,
              CASE 
                /* Handle pre-1980 songs */
                WHEN b.year BETWEEN 1970 AND 1979 THEN '1970s'
                WHEN b.year < 1980 THEN 'pre1980'
                /* Handle other decades normally */
                WHEN b.year BETWEEN 1980 AND 1989 THEN '1980s'
                WHEN b.year BETWEEN 1990 AND 1999 THEN '1990s'
                WHEN b.year BETWEEN 2000 AND 2009 THEN '2000s'
                ELSE '2010s'
              END as category
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
            /* For pre1980 category, exclude 70s songs since they have their own category */
            AND NOT (CASE 
              WHEN b.year BETWEEN 1970 AND 1979 THEN '1970s'
              WHEN b.year < 1980 THEN 'pre1980'
              WHEN b.year BETWEEN 1980 AND 1989 THEN '1980s'
              WHEN b.year BETWEEN 1990 AND 1999 THEN '1990s'
              WHEN b.year BETWEEN 2000 AND 2009 THEN '2000s'
              ELSE '2010s'
            END = 'pre1980' AND b.year BETWEEN 1970 AND 1979)
          ),
          random_songs AS (
            SELECT a.*, d.priority, d.count,
              ROW_NUMBER() OVER (PARTITION BY a.category ORDER BY RAND()) as rn
            FROM available_songs a
            JOIN decades d ON a.category = d.category
          )
          SELECT id, title, artist, year, ranking
          FROM random_songs r
          WHERE rn <= r.count
          /* Order by priority for pre-1980 categories first, then randomly for the rest */
          ORDER BY 
            CASE 
              WHEN r.year < 1980 THEN r.priority 
              ELSE 999999 
            END,
            RAND()
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
