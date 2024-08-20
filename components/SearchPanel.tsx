import React, { useState, useEffect } from "react";
import SearchBar2 from "./SearchBar2";
import SearchResults from "./SearchResults";
import { Box, Grid } from "@mui/material";
import { SongParams } from "@/types";

interface SearchPanelProps {
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
  searchResults: SongParams[];
  setSearchResults: React.Dispatch<React.SetStateAction<SongParams[]>>;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  songlist,
  setSonglist,
  searchResults,
  setSearchResults,
}) => {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() !== "") {
        try {
          const response = await fetch(
            `/api/searchlibrary?query=${encodeURIComponent(query)}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }

          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setSearchResults([]);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div>
      <SearchBar2 query={query} setQuery={setQuery} />
      <SearchResults
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        songlist={songlist}
        setSonglist={setSonglist}
      />
    </div>
  );
};

export default SearchPanel;
