import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { SongParams } from "@/types/index.js";

interface CommandBarProps {
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
}

function CommandBar({ songlist, setSonglist }: CommandBarProps) {
  const [open, setOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const handleReload = () => {
    console.log("Reload action");
    // Implement reload action
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleConfirmFinalize = async () => {
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
      handleCloseModal();
    } catch (error) {
      console.error("Error finalizing songlist:", error);
    }
  };

  const handleFetchYear = async () => {
    try {
      const updatedSonglist = await Promise.all(
        songlist.map(async (song) => {
          const response = await fetch("/api/fetchyear", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ song }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch year");
          }

          const result = await response.json();
          return { ...song, releaseYear: result.oldestYear };
        })
      );

      setSonglist(updatedSonglist);
      console.log("Songlist updated with release years:", updatedSonglist);
    } catch (error) {
      console.error("Error fetching release years:", error);
    }
  };

  const handleExport = () => {
    const formattedSonglist = songlist
      .map((song) => {
        let releaseYear = "";
        if (song.releaseYear && song.year) {
          releaseYear = `(${Math.min(song.releaseYear, song.year)})`;
        } else if (song.releaseYear) {
          releaseYear = `(${song.releaseYear})`;
        } else if (song.year) {
          releaseYear = `(${song.year})`;
        }
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

  const handleAISort = async () => {
    setIsReordering(true);
    try {
      const response = await fetch("/api/aireorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songs: songlist }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder songs");
      }

      const result = await response.json();
      setSonglist(result.reorderedSongs);
      console.log("Songs reordered by AI:", result.reorderedSongs);
    } catch (error) {
      console.error("Error reordering songs:", error);
    } finally {
      setIsReordering(false);
    }
  };

  const commands = [
    // { name: "Reload", handler: handleReload },
    { name: "Shuffle", handler: handleShuffle },
    { name: "Fetch Year", handler: handleFetchYear },
    { name: "AI reorder", handler: handleAISort }, 
    { name: "Export", handler: handleExport },
    { name: "Finalize", handler: handleOpenModal },
  ];

  return (
    <div>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          {commands.map(({ name, handler }) => (
            <Button 
              key={name} 
              color="inherit" 
              onClick={handler}
              disabled={name === "AI reorder" && isReordering}
            >
              {name === "AI reorder" && isReordering ? "Reordering..." : name}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Dialog
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="confirm-finalize-dialog"
      >
        <DialogTitle id="confirm-finalize-dialog">Confirm Finalize</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to finalize the songlist?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmFinalize} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CommandBar;
