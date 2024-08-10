import React from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { Box, Grid } from "@mui/material";

const SearchPanel = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box>
        {/* <Grid container spacing={0} sx={{ mt: "2px" }}> */}
        {/* <Item sx={{ flexGrow: "3" }}> */}
        <SearchBar />
        <SearchResults />
        {/* </Item> */}
        {/* </Grid> */}
      </Box>
    </div>
  );
};

export default SearchPanel;
