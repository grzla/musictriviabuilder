import type { NextApiRequest, NextApiResponse } from 'next';
import { SongParams } from '@/types';

const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;

async function searchTrack(artist: string, title: string): Promise<string | null> {
    try {
        const query = `artist:${encodeURIComponent(artist)} track:${encodeURIComponent(title)}`;
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
            }
        });

        if (!response.ok) {
            console.error(`Spotify API error: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        if (data.tracks.items.length > 0) {
            const track = data.tracks.items[0];
            return track.id;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error searching track:', error);
        return null;
    }
}

async function generateEmbed(artist: string, title: string): Promise<string> {
    try {
        const trackId = await searchTrack(artist, title);
        if (trackId) {
            return `<iframe src="https://open.spotify.com/embed/track/${trackId}" width="80" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        } else {
            return 'Track not found';
        }
    } catch (error) {
        console.error('Error generating embed:', error);
        return 'Error generating embed';
    }
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            console.log('Request body:', req.body);
            const songs: SongParams[] = req.body;

            if (!Array.isArray(songs) || songs.length === 0) {
                return res.status(400).json({ error: 'Invalid input' });
            }

            const embeds = await Promise.all(songs.map(song => generateEmbed(song.artist, song.title)));

            return res.status(200).json({ embeds });
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error handling POST request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}