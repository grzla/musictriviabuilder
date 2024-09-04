import { SongParams } from "@/types";
import { connectToSql } from "@/lib/db/mysql";
import { PoolConnection } from 'mysql2/promise'; // 

// might make sense to have an artist normalization function and a title normalization function
// some titles have things like: Humpty Dance, The
// also the back apostrophe is causing matching problems. needs to be replaced with regular apostrophe

/*
  Compose a query to return a random song from the billboardsongs table based on the provided year.

  Default behavior is to return a random song within the decade of the provided year.
  If 'exactYear' is true, it returns a random song within that specific year. 
  If year is not provided, it returns a random song from any year in the billboardsongs table. 
  
  The query excludes songs that exist in the 'usedsongs', 'donotplay', and 'requests' tables.
*/
export const composeQuery = (year: number | null, exactYear: boolean = false): string => {
  let yearCondition = '';
  let startYear: number | null = null;
  let endYear: number | null = null;

  if (year !== null) {
    if (exactYear) {
      yearCondition = `year = ${year}`;
    } else {
      // build the year condition
      if (year < 1980) {
        startYear = null;
        endYear = 1979;
      } else if (year >= 1980 && year <= 1989) {
        startYear = 1980;
        endYear = 1989;
      } else if (year >= 1990 && year <= 1999) {
        startYear = 1990;
        endYear = 1999;
      } else if (year >= 2000 && year <= 2009) {
        startYear = 2000;
        endYear = 2009;
      } else if (year >= 2010) {
        startYear = 2010;
        endYear = null; // Current year
      }
      // build the year condition
      yearCondition = startYear !== null && endYear !== null
        ? `year BETWEEN ${startYear} AND ${endYear}`
        : startYear !== null
          ? `year >= ${startYear}`
          : endYear !== null
            ? `year <= ${endYear}`
            : '';
    }
  }

  const tableNames = ['usedsongs', 'donotplay', 'requests'];

  const notExistsSubqueries = tableNames.map(tableName => `
      NOT EXISTS (
          SELECT 1 
          FROM ${tableName} 
          WHERE TRIM(SUBSTRING_INDEX(${tableName}.Artist, 'featuring', 1)) LIKE CONCAT('%', TRIM(SUBSTRING_INDEX(billboardsongs.Artist, 'featuring', 1)), '%') 
          AND TRIM(${tableName}.Title) LIKE CONCAT('%', TRIM(billboardsongs.Title), '%')
      )
  `).join(' AND ');

  const whereClause = year !== null
    ? `WHERE ${yearCondition} AND ${notExistsSubqueries}`
    : `WHERE ${notExistsSubqueries}`;

  return `
    SELECT *
    FROM billboardsongs
    ${whereClause}
    ORDER BY RAND()
    LIMIT 1
  `;
};

export const removeFeaturingAnd = (artist: string): string => {
  // remove the rest of any part of the string which includes f. ft. feat. featuring and
  return artist.replace(/\b(f\.?|ft\.?|feat\.?|featuring|and|&)\b.*$/gi, '').trim();
}
export const checkSongInLibrary = async (song: SongParams) => {
  try {
    const response = await fetch("/api/matchsongtolibrary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(song),
    });

    if (response.ok) {
      const matches = await response.json();
      return matches.length > 0;
    } else {
      console.error("Error fetching library matches:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error fetching library matches:", error);
    return false;
  }
};


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
      inLibrary: null,
      gameNum: null,
      gameCat: null
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