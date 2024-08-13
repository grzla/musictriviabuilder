import React from "react";
import { Box } from "@mui/material";

interface SearchResultsProps {
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query }) => {
  // Placeholder for actual search results logic
  const results = ["Result 1", "Result 2", "Result 3"].filter((result) =>
    result.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box>
      {results.length > 0 ? (
        results.map((result, index) => <div key={index}>{result}</div>)
      ) : (
        <div>No results found</div>
      )}
    </Box>
  );
};

export default SearchResults;
