import { SongParams } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

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
            return `<iframe src="https://open.spotify.com/embed/track/${trackId}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
        } else {
            return 'Track not found';
        }
    } catch (error) {
        console.error('Error generating embed:', error);
        return 'Error generating embed';
    }
}

export async function POST(req: NextRequest) {
    try {
        const songs: SongParams[] = await req.json();
        console.log('Received POST request in fetchpreviews');
        console.log('Request body:', songs);

        if (!Array.isArray(songs) || songs.length === 0) {
            console.log('Invalid input: songs is not an array or is empty');
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        console.log('Generating embeds for songs:', songs);
        const embeds = await Promise.all(songs.map(song => generateEmbed(song.artist, song.title)));
        console.log('Generated embeds:', embeds);

        return NextResponse.json({ embeds });
    } catch (error) {
        console.error('Error handling POST request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}