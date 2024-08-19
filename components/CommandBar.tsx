import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SearchBar from "./SearchBar.tsx";
import { SongParams } from "@/types/index.js";

interface CommandBarProps {
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
}

function CommandBar({ songlist, setSonglist }: CommandBarProps) {
  const handleReload = () => {
    console.log("Reload action");
    // Implement reload action
  };

  const handleFinalize = async () => {
    console.log("Finalize action");
    try {
      const response = await fetch("/api/usedsongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songlist),
      });

      if (!response.ok) {
        throw new Error("Failed to finalize songlist");
      }

      const result = await response.json();
      console.log("Songlist finalized:", result);
    } catch (error) {
      console.error("Error finalizing songlist:", error);
    }
  };

  const handleFetchYear = () => {
    console.log("Fetch Year action");
    // Implement fetch year action
  };

  const handleExport = () => {
    const formattedSonglist = songlist
      .map((song) => {
        const releaseYear = song.releaseYear ? `(${song.releaseYear})` : "";
        return `${song.artist} - ${song.title} ${releaseYear}`;
      })
      .join("\n");

    navigator.clipboard
      .writeText(formattedSonglist)
      .then(() => {
        console.log("Songlist copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy songlist: ", err);
      });
  };

  const handleShuffle = () => {
    setSonglist((prevList) => {
      const newList = [...prevList];
      for (let i = newList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[j]] = [newList[j], newList[i]];
      }
      return newList;
    });
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
