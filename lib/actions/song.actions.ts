import { SongParams } from "@/types";
import { connectToSql } from "@/lib/db/mysql";
import { PoolConnection } from 'mysql2/promise'; // 


export const matchSongToLibrary = async (song: SongParams): Promise<SongParams[]> => {
  
  let connection: PoolConnection | null = null;
  try {
      connection = await connectToSql();

      const { artist, title } = song;

      if (!artist && !title) {
        return []
      }

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
      id: row.id,
      artist: row.artist,
      title: row.title,
      year: row.year,
      ranking: null,
      releaseYear: null,
      inLibrary: null
    }));

    return songs;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/*
export const replaceSongsNotInLibrary = async (songs: SongParams[]): Promise<SongParams[]> => {
  let connection: PoolConnection | null = null;
  try {
    connection = await connectToSql();
    */