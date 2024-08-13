import React, { useState } from "react";
import SearchBar2 from "./SearchBar2";
import SearchResults from "./SearchResults";
import { Box, Grid } from "@mui/material";

const SearchPanel = () => {
  const [query, setQuery] = useState("");
  return (
    <div>
      <SearchBar2 query={query} setQuery={setQuery} />
      <SearchResults query={query} />
    </div>
  );
};

export default SearchPanel;
