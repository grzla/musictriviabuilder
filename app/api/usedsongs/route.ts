import type { NextApiRequest, NextApiResponse } from 'next';
import { SongParams } from '@/types/index.d';
import { connectToSql } from "@/lib/db/mysql";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const songs: SongParams[] = req.body;

        if (!Array.isArray(songs) || songs.length === 0) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const connection = await connectToSql();

        const insertPromises = songs.map(song => {
            let query = 'INSERT INTO usedsongs (artist, title';
            const params: string[] = [song.artist, song.title];

            if (song.year !== null && song.year !== undefined) {
                query += ', year';
                params.push(song.year.toString());
            }

            if (song.releaseYear !== null && song.releaseYear !== undefined) {
                query += ', releaseYear';
                params.push(song.releaseYear.toString());
            }

            query += ') VALUES (?, ?';
            
            if (song.year !== null && song.year !== undefined) {
                query += ', ?';
            }

            if (song.releaseYear !== null && song.releaseYear !== undefined) {
                query += ', ?';
            }

            query += ')';
            console.log(query);
            return connection.execute(query, params);
        });

        await Promise.all(insertPromises);

        await connection.end();

        return res.status(200).json({ message: 'Songs inserted successfully' });
    } catch (error) {
        console.error('Error inserting songs:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}