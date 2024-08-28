import { SongParams } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

async function getSpotifyAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.SPOTIFY_CLIENT_ID || '',
        client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Spotify access token: ${data.access_token}`);
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error);
    return null;
  }
}

let SPOTIFY_ACCESS_TOKEN: string | null = null;
let tokenExpirationTime: number = 0;

async function getValidSpotifyAccessToken(): Promise<string | null> {
  const currentTime = Date.now();
  if (!SPOTIFY_ACCESS_TOKEN || currentTime >= tokenExpirationTime) {
    SPOTIFY_ACCESS_TOKEN = await getSpotifyAccessToken();
    if (SPOTIFY_ACCESS_TOKEN) {
      tokenExpirationTime = currentTime + 3600000; // Set expiration to 1 hour from now
    }
  }
  return SPOTIFY_ACCESS_TOKEN;
}

async function searchTrack(artist: string, title: string): Promise<string | null> {
    try {
        const query = `artist:${encodeURIComponent(artist)} track:${encodeURIComponent(title)}`;
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${await getValidSpotifyAccessToken()}`
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

        if (!Array.isArray(songs) || songs.length === 0) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const embeds = await Promise.all(songs.map(song => generateEmbed(song.artist, song.title)));

        return NextResponse.json({ embeds });
    } catch (error) {
        console.error('Error handling POST request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}