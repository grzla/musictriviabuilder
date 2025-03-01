// app/api/processSongs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { SongParams } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})


export async function POST(request: NextRequest) {
  const { nameThatTuneSongs, decadesSongs }: { 
    nameThatTuneSongs: SongParams[],
    decadesSongs: SongParams[] 
  } = await request.json();

  // Process both songlists
  const processRoundSongs = async (songs: SongParams[]) => {
    const songlist = songs.map(song => `${song.artist} - ${song.title})`).join('\n');
    
    const prompt = `
    Here is a list of songs. Retrieve the original release year of each song. 
    Return the result as a JSON array of objects, each with the fields: "artist", "title", and "releaseYear".

    Songs:
    ${songlist}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert in music curation.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from API');
    }

    // Try to extract JSON from the content
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in API response');
    }

    const jsonContent = jsonMatch[0];
    return JSON.parse(jsonContent);
  };

  try {
    // Process both rounds in parallel
    const [nameThatTuneResult, decadesResult] = await Promise.all([
      processRoundSongs(nameThatTuneSongs),
      processRoundSongs(decadesSongs)
    ]);

    return NextResponse.json({ 
      nameThatTuneSongs: nameThatTuneResult,
      decadesSongs: decadesResult
    });

  } catch (error) {
    console.error('Error:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ message: 'An error occurred while processing the songs' }, { status: 500 });
  }
}
