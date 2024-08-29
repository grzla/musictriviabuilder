// app/api/processSongs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { SongParams } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})


export async function POST(request: NextRequest) {
  const { songs }: { songs: SongParams[] } = await request.json();

  const songlist = songs.map(song => `${song.artist} - ${song.title})`).join('\n');
  
  const prompt = `
  Here is a list of songs. Retrieve the original release year of each song.  Shuffle the list. Reorder harmonically with an energy peak 3/4 through the list.
  Return the result as a JSON array of objects, each with the fields: "artist", "title", and "releaseYear".

  Songs:
  ${songlist}
`;

  try {
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
      return NextResponse.json({ message: 'Empty response from API' }, { status: 500 });
    }

    console.log('Raw API response:', content);

    // Try to extract JSON from the content
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[0];
      console.log('Extracted JSON:', jsonContent);
      
      try {
        const parsedContent = JSON.parse(jsonContent);
        return NextResponse.json({ reorderedSongs: parsedContent });
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return NextResponse.json({ message: 'Invalid JSON returned from API' }, { status: 500 });
      }
    } else {
      console.error('No valid JSON found in the API response');
      return NextResponse.json({ message: 'No valid JSON found in API response' }, { status: 500 });
    }
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
