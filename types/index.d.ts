export type Status = 'played' | 'unplayed' | 'donotplay' | null;
export type GameCat = 'namethattune' | 'decades';

export type SongParams = {
  id: number;
  artist: string;
  title: string;
  year: number | null;
  ranking: number | null;
  releaseYear: number | null;
  inLibrary: boolean | null;
  gameNum: number | null;
  gameCat: GameCat | null;
};
