import { SongParams } from "@/types";
import { connectToSql } from "@/lib/db/mysql";
import { PoolConnection } from 'mysql2/promise';

/*
  Compose a query to return a random song from the billboardsongs table based on the provided year.

  Default behavior is to return a random song within the decade of the provided year.
  If 'exactYear' is true, it returns a random song within that specific year. 
  If year is not provided, it returns a random song from any year in the billboardsongs table. 
  If libraryOnly is true, only returns songs that exist in the library.
*/
export const composeQuery = (year: number | null, exactYear: boolean = false, libraryOnly: boolean = false): string => {
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

  // Base query for getting songs that haven't been used/banned/requested
  const notExistsSubqueries = `
    NOT EXISTS (
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
    )`;

  // For replacements, only return songs that exist in the library
  if (libraryOnly) {
    return `
      WITH available_songs AS (
        SELECT b.*
        FROM billboardsongs b
        INNER JOIN librarysongs l ON 
          l.normalized_artist = b.normalized_artist AND
          l.normalized_title = b.normalized_title
        WHERE ${notExistsSubqueries}
        ${year !== null ? `AND b.${yearCondition}` : ''}
      )
      SELECT *
      FROM available_songs
      ORDER BY RAND()
      LIMIT 1
    `;
  }

  // For initial load, return any billboard song
  return `
    SELECT b.*
    FROM billboardsongs b
    WHERE ${notExistsSubqueries}
    ${year !== null ? `AND b.${yearCondition}` : ''}
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

    const { id } = song;

    if (!id) {
      return []
    }

    // Use normalized columns for matching
    const query = `
      SELECT l.id, l.artist, l.title, l.year
      FROM librarysongs l
      JOIN billboardsongs b ON 
        l.normalized_artist = b.normalized_artist AND
        l.normalized_title = b.normalized_title
      WHERE b.id = ?
      LIMIT 10;
    `;

    const [results] = await connection.execute(query, [id]);

    const songs: SongParams[] = (results as any[]).map(row => ({
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
