import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SearchBar from "./SearchBar.tsx";

function CommandBar() {
  const handleReload = () => {
    console.log("Reload action");
    // Implement reload action
  };

  const handleFinalize = () => {
    console.log("Finalize action");
    // Implement finalize action
  };

  const handleFetchYear = () => {
    console.log("Fetch Year action");
    // Implement fetch year action
  };

  const handleExport = () => {
    console.log("Export action");
    // Implement export action
  };

  const handleShuffle = () => {
    console.log("Shuffle action");
    // Implement shuffle action
  };

  const commands = [
    { name: "Reload", handler: handleReload },
    { name: "Shuffle", handler: handleShuffle },
    { name: "Fetch Year", handler: handleFetchYear },
    { name: "Finalize", handler: handleFinalize },
    { name: "Export", handler: handleExport },
  ];

  return (
    // <AppBar position="static">
    <AppBar sx={{ position: "relative" }}>
      <Toolbar>
        {commands.map(
          (
            { name, handler } // Corrected destructuring
          ) => (
            <Button
              key={name} // Corrected key assignment
              color="inherit"
              onClick={handler} // Corrected onClick assignment
            >
              {name}
            </Button>
          )
        )}
        {/* <SearchBar /> */}
      </Toolbar>
    </AppBar>
  );
}

export default CommandBar;
