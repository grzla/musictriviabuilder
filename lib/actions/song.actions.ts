import { SongParams } from "@/types";

export const checkSongInLibrary = async (song: SongParams): Promise<boolean> => {
  try {
    const response = await fetch("/api/matchsongtolibrary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(song),
    });

    if (response.ok) {
      const matches = await response.json();
      return matches.length > 0;
    } else {
      console.error("Error fetching library matches:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error fetching library matches:", error);
    return false;
  }
};

export const matchSongToLibrary = async (song: SongParams): Promise<SongParams[]> => {
  try {
    const response = await fetch("/api/matchsongtolibrary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(song),
    });

    if (!response.ok) {
      throw new Error("Failed to match song to library");
    }

    return await response.json();
  } catch (error) {
    console.error('Error matching song to library:', error);
    return [];
  }
};

export const fetchSongPreviews = async (songs: SongParams[]): Promise<string[]> => {
  try {
    const response = await fetch("/api/fetchpreviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(songs),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch previews');
    }

    const data = await response.json();
    return data.embeds;
  } catch (error) {
    console.error("Failed to fetch Spotify embeds:", error);
    return [];
  }
};

export const addSongToDoNotPlay = async (song: SongParams): Promise<void> => {
  try {
    const response = await fetch("/api/donotplay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song }),
    });

    if (!response.ok) {
      throw new Error('Failed to add song to do-not-play list');
    }
  } catch (error) {
    console.error("Failed to add song to do-not-play list:", error);
    throw error;
  }
};

export const addSongToRequests = async (song: SongParams): Promise<void> => {
  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song }),
    });

    if (!response.ok) {
      throw new Error('Failed to add song to requests');
    }
  } catch (error) {
    console.error("Error requesting song:", error);
    throw error;
  }
};

export const logSongSearchMismatch = async (song: SongParams): Promise<void> => {
  try {
    const response = await fetch("/api/searchmismatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ song }),
    });

    if (!response.ok) {
      throw new Error('Failed to log search mismatch');
    }
  } catch (error) {
    console.error("Error logging search mismatch:", error);
    throw error;
  }
};

export const replaceSongInYear = async (song: SongParams): Promise<SongParams> => {
  try {
    const { year } = song;
    const response = await fetch(`/api/song?year=${year}&libraryOnly=true`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch replacement song");
    }
    
    const responseData = await response.json();
    const newSong = {
      ...responseData[0],
      inLibrary: true // Song is guaranteed to be in library by our optimized query
    };

    if (!newSong || !newSong.id) {
      throw new Error("Invalid song object returned from the API");
    }

    return newSong;
  } catch (error) {
    console.error("Failed to replace song:", error);
    throw error;
  }
};
