import React from "react";
import { Box, Typography } from "@mui/material";

interface SearchResultsProps {
  results: any[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  // Placeholder for actual search results logic

  return (
    <Box sx={{ textAlign: "left" }}>
      {results.length > 0 ? (
        results.map((result, index) => (
          <Typography key={index} variant="body1" sx={{ mb: 1 }}>
            {result.Artist} - {result.Title} ({result.Year})
          </Typography>
        ))
      ) : (
        <Typography variant="body1">No results found</Typography>
      )}
    </Box>
  );
};

export default SearchResults;
