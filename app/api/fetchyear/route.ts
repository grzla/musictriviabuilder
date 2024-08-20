'use server'
import { SongParams } from '@/types/index.d';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { song }: { song: SongParams } = body;
        const { artist, title } = song;

        if (!artist || !title) {
            return NextResponse.json({ error: 'Artist and title are required' }, { status: 400 });
        }

        // Query MusicBrainz API
        const query = `artist:${artist} AND recording:${title}`;
        const encodedQuery = encodeURIComponent(query);
        const musicBrainzUrl = `https://musicbrainz.org/ws/2/recording/?query=${encodedQuery}&fmt=json`;

        const response = await fetch(musicBrainzUrl, {
            headers: {
                'User-Agent': 'musictriviabuilder/0.5 (greg.j.lundberg@gmail.com)'
            }
        });
        if (!response.ok) {
            console.error(`Failed to fetch data from MusicBrainz API: ${response.statusText}`);
            throw new Error('Failed to fetch data from MusicBrainz API');
        }
        const data = await response.json();

        const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
        const dates = data.recordings.flatMap((recording: any) => {
            const matches = recording['first-release-date']?.match(dateRegex);
            return matches ? matches : [];
        });

        if (dates.length === 0) {
            console.error('No dates found in the response');

            return NextResponse.json({ error: 'No dates found in the response' }, { status: 404 });
        }

        // Sort dates and get the oldest one
        const sortedDates = dates.sort();
        const oldestDate = sortedDates[0].split('-')[0]; // Extract the year

        return NextResponse.json({ oldestYear: oldestDate }, { status: 200 });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } 
}