'use server'
import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";
import { PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
    let connection: PoolConnection | null = null;
    try {
      connection = await connectToSql();

      const body: SongParams[] = await req.json();

      if (!Array.isArray(body) || body.length === 0) {
          return NextResponse.json({ error: 'Request body must be a non-empty array of songs' }, { status: 400 });
      }

      const results = [];
      for (const song of body) {
          const { artist, title, year, releaseYear } = song;

          if (!artist || !title) {
              return NextResponse.json({ error: 'Artist and title are required for each song' }, { status: 400 });
          }

          const query = 'INSERT INTO testusedsongs (artist, title, year, releaseYear) VALUES (?, ?, ?, ?)';
          const [result] = await connection.query(query, [artist, title, year, releaseYear]);
          results.push(result);
      }

      return NextResponse.json(results, { status: 200 });
  } catch (error) {
      console.error('Error inserting songs:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
      if (connection) {
        connection.release();
      }
  }
}