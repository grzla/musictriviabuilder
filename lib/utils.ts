import {SongParams} from "@/types/index.d"

export const testSongs: SongParams[] = [
    {
      // id: "1",
      artist: "Dexy's Midnight Runners",
      title: "Come On Eileen",
      year: 2019,
      rank: 5,
      releaseYear: null,
    },
    {
      // id: "2",
      artist: "Blur",
      title: "Song 2",
      year: 2019,
      rank: 3,
      releaseYear: null,
    },
    {
      // id: "3",
      artist: "Tina Turner",
      title: "We Don't Need Another Hero",
      year: 2019,
      rank: 2,
      releaseYear: null,
    },
    {
      // id: "4",
      artist: "Song 4",
      title: "Artist 4",
      year: 2019,
      rank: 1,
      releaseYear: null,
    },
    {
      // id: "5",
      artist: "Song 5",
      title: "Artist 5",
      year: 2019,
      rank: 10,
      releaseYear: null,
    },
  ];


// ERROR HANDLER
export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    // This is a native JavaScript error (e.g., TypeError, RangeError)
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    // This is a string error message
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    // This is an unknown type of error
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};
