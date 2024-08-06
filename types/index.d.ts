export type Status = 'played' | 'unplayed' | 'donotplay' | null;


export type SongParams = {
  // id: string;
  artist: string;
  title: string;
  year?: number;
  rank?: number;
  releaseYear?: number | null;
  status?: Status;
  datePlayed?: Date | null;
  normalizedArtist?: string;
  normalizedTitle?: string;
  hash?: Number[];
};

/* union types
export type SongParams = {
  // id: string;
  artist: string;
  title: string;
  year?: number;
}

export type SongParamsBillboard = SongParams & {
  rank: number;
}

export type SongParamsTrivia = SongParams & SongParamsBillboard & {
  releaseYear?: number | null;
  status?: Status;
  datePlayed?: Date | null;
  normalizedArtist?: string;
  normalizedTitle?: string;
  hash?: string;
};
*/