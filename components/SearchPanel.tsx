import React, { useState, useEffect } from "react";
import SearchBar2 from "./SearchBar2";
import SearchResults from "./SearchResults";
import { Box, Grid } from "@mui/material";

const SearchPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

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
          setResults(data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      } else {
        setResults([]);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div>
      <SearchBar2 query={query} setQuery={setQuery} />
      <SearchResults results={results} />
    </div>
  );
};

export default SearchPanel;
