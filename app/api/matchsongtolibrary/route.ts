import { NextRequest, NextResponse } from 'next/server';
import { SongParams } from '@/types';
import { connectToSql } from '@/lib/db/mysql';
import { PoolConnection } from 'mysql2/promise';

function tokenize(text: string): string {
  return text
      .toLowerCase()
      .replace(/[\.\,\(\)\!]/g, '') // Remove dots and commas
      // .replace(/\b(ft|feat|featuring)\b/g, 'f') // Normalize featuring variations
      // .replace(/\b(and|&|the)\b/g, '') // Remove "and", "&", and "the"
      .replace(/\b(ft|feat|featuring)\b.*$/i, '') // Remove "ft", "feat", or "featuring" and anything that follows
      .replace(/\b(and|&|the)\b.*$/i, '') // Remove "and", "&", and "the"
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim();
}

export const POST = async (req: NextRequest) => {
  let connection: PoolConnection | null = null;

  try {
    const song: SongParams = await req.json();
    
    if (!song) {
      return NextResponse.json([], { status: 200 });
    }

    connection = await connectToSql();

    // Get normalized values from billboardsongs
    let normalizedRow;
    if (song.id) {
      const [results] = await connection.execute(`
        SELECT normalized_artist, normalized_title
        FROM billboardsongs
        WHERE id = ?
      `, [song.id]);
      normalizedRow = (results as any[])[0];
    } else if (song.artist && song.title) {
      const [results] = await connection.execute(`
        SELECT normalized_artist, normalized_title
        FROM billboardsongs
        WHERE artist = ? AND title = ?
      `, [song.artist, song.title]);
      normalizedRow = (results as any[])[0];
    } else {
      return NextResponse.json([], { status: 200 });
    }

    if (!normalizedRow) {
      return NextResponse.json([], { status: 200 });
    }

    // Use the normalized values to find matches in library
    const query = `
      SELECT MIN(id) as id, artist, title, year
      FROM librarysongs
      WHERE normalized_artist = ? 
      AND normalized_title = ?
      GROUP BY artist, title, year
      LIMIT 10;
    `;
    const [results] = await connection.execute(query, [
      normalizedRow.normalized_artist,
      normalizedRow.normalized_title
    ]);

    interface LibrarySongRow {
      id: number;
      artist: string;
      title: string;
      year: number;
    }

    const songs: SongParams[] = (results as LibrarySongRow[]).map(row => ({
      id: row.id,
      artist: row.artist,
      title: row.title,
      year: row.year,
      ranking: null,
      releaseYear: null,
      inLibrary: (results as LibrarySongRow[]).length > 0 ? true : null,
      gameNum: null,
      gameCat: null
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
