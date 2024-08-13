import React from "react";
import { Box } from "@mui/material";

interface SearchResultsProps {
  results: any[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  // Placeholder for actual search results logic

  return (
    <Box>
      {results.length > 0 ? (
        results.map((result, index) => (
          <li key={index}>
            {result.Artist} - {result.Title} ({result.Year})
          </li>
        ))
      ) : (
        <div>No results found</div>
      )}
    </Box>
  );
};

export default SearchResults;
