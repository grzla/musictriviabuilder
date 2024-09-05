import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { SongParams, GameCat } from "@/types";

interface SearchResultsProps {
  searchResults: SongParams[];
  setSearchResults: React.Dispatch<React.SetStateAction<SongParams[]>>;
  songlist: {
    [key in GameCat]: SongParams[]
  };
  setSonglist: React.Dispatch<React.SetStateAction<{
    [key in GameCat]: SongParams[]
  }>>;
  currentRound: GameCat;
  queueToSonglist: (song: SongParams, cat?: GameCat) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  setSearchResults,
  songlist,
  setSonglist,
  currentRound,
}) => {
  const addSong = (song: SongParams) => {
    song.inLibrary = true;
    setSonglist(prevSonglist => ({
      ...prevSonglist,
      [currentRound]: [...prevSonglist[currentRound], song]
    }));
  };

  return (
    <Box sx={{ textAlign: "left" }}>
      {searchResults.length > 0 ? (
        searchResults.map((result, index) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 2, minWidth: "40px", p: "2px 2px" }}
              onClick={() => addSong(result as SongParams)}
            >
              Add
            </Button>
            <Typography
              variant="body2"
              sx={{ flexGrow: 1, fontSize: "0.875rem" }}
            >
              {result.artist} - {result.title} ({result.year})
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          No results found
        </Typography>
      )}
    </Box>
  );
};

export default SearchResults;
