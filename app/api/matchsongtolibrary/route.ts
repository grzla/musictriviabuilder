import { NextRequest, NextResponse } from 'next/server';
import { SongParams } from '@/types';
import { connectToSql } from '@/lib/db/mysql';
import { PoolConnection } from 'mysql2/promise';

function tokenize(text: string): string {
  return text
      .toLowerCase()
      .replace(/[\.\,\']/g, '') // Remove dots and commas
      .replace(/\b(ft|feat|featuring)\b/g, 'f') // Normalize featuring variations
      .replace(/\b(and|&|the)\b/g, '') // Remove "and", "&", and "the"
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim()
      // .split(' ') // Split into words
      // .sort() // Sort words alphabetically
      // .join(' '); // Join back into a single string
}

export const POST = async (req: NextRequest) => {
  let connection: PoolConnection | null = null;

  try {
    const { artist, title }: SongParams = await req.json();
    
    if (!artist && !title) {
      return NextResponse.json([], { status: 200 });
    }

    connection = await connectToSql();

    // Tokenize artist and title
    const tokenizedArtist = artist ? tokenize(artist) : '';
    const tokenizedTitle = title ? tokenize(title) : '';
    const searchTokens = [...tokenizedArtist.split(' '), ...tokenizedTitle.split(' ')];


    /*
    const artistTokens = artist ? artist.split(/\s+/) : [];
    const titleTokens = title ? title.split(/\s+/) : [];
    const searchTokens = [...artistTokens, ...titleTokens];
    */
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
      id: row.id,
      artist: row.artist,
      title: row.title,
      year: row.year,
      ranking: null,
      releaseYear: null,
      inLibrary: (results as any[]).length > 0 ? true : null
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