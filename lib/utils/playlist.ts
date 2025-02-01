import { SongParams, GameCat } from "@/types";

export type SongList = {
  [key in GameCat]: SongParams[];
};

export const sendSongBetweenLists = (
  songlist: SongList,
  currentRound: GameCat,
  index: number
): SongList => {
  const updatedSongs = { ...songlist };
  const songToSend = updatedSongs[currentRound][index];
  const oppositeRound = currentRound === 'namethattune' ? 'decades' : 'namethattune';
  
  // Add the song to the opposite round, but only if it's not already there
  if (!updatedSongs[oppositeRound].some(song => song.id === songToSend.id)) {
    updatedSongs[oppositeRound].push(songToSend);
  }
  
  return updatedSongs;
};

export const deleteSongFromList = (
  songlist: SongList,
  currentRound: GameCat,
  index: number
): SongList => {
  const updatedSongs = { ...songlist };
  updatedSongs[currentRound] = updatedSongs[currentRound]
    .filter((_, i) => i !== index);
  return updatedSongs;
};

export const reorderSongList = (
  songlist: SongList,
  currentRound: GameCat,
  oldIndex: number,
  newIndex: number
): SongList => {
  const list = [...songlist[currentRound]];
  const [removed] = list.splice(oldIndex, 1);
  list.splice(newIndex, 0, removed);
  
  return {
    ...songlist,
    [currentRound]: list
  };
};
