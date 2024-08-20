import { NextRequest, NextResponse } from 'next/server';
import { SongParams } from '@/types';
import { connectToSql } from '@/lib/db/mysql';
import { PoolConnection } from 'mysql2/promise';

export const POST = async (req: NextRequest) => {
  let connection: PoolConnection | null = null;

  try {
    const { artist, title }: SongParams = await req.json();
    
    if (!artist && !title) {
      return NextResponse.json([], { status: 200 });
    }

    connection = await connectToSql();

    // Tokenize artist and title
    const artistTokens = artist ? artist.split(/\s+/) : [];
    const titleTokens = title ? title.split(/\s+/) : [];
    const searchTokens = [...artistTokens, ...titleTokens];

    // Build the WHERE clause dynamically based on search tokens
    const whereClauses: string[] = searchTokens.map(token => {
      const escapedToken = connection!.escape(`%${token}%`);
      return `(Artist LIKE ${escapedToken} OR Title LIKE ${escapedToken})`;
    });

    const query = `
      SELECT MIN(id) as id, artist, title, year
      FROM librarysongs
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY artist, title, year
      LIMIT 10;
    `;
    const [results] = await connection.query(query);

    const songs: SongParams[] = (results as any[]).map((row: any) => ({
      artist: row.artist,
      title: row.title,
    }));

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Error fetching songs' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};