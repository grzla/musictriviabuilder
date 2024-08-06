"use server";

import { revalidatePath } from "next/cache";

import Song from "../db/models/song.model";
import { connectToDatabase } from "../db/mongoose";
import { handleError } from "@/lib/utils";
import { SongParams } from '@/types';
import chalk from "chalk";

// CREATE
export async function createSong(song: SongParams) {
  try {
    
    await connectToDatabase();
    
    const newSong = await Song.create(song);

    return JSON.parse(JSON.stringify(newSong));
  } catch (error) {
    handleError(error);
  }
}
