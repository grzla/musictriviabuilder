import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { SongParams } from "@/types";

interface SearchResultsProps {
  searchResults: SongParams[];
  setSearchResults: React.Dispatch<React.SetStateAction<SongParams[]>>;
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults: searchResults,
  setSearchResults,
  songlist,
  setSonglist,
}) => {
  const addSong = (song: SongParams) => {
    setSonglist([...songlist, song]);
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
