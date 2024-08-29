import React, { useState, memo } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SongParams } from "@/types/index.js";

interface CommandBarProps {
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
  embeds: string[];
  setEmbeds: React.Dispatch<React.SetStateAction<string[]>>;
}

// Memoized Embed Component
const SpotifyPlayer = memo(({ embed }: { embed: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: embed }} />;
});

function CommandBar({ songlist, setSonglist, embeds, setEmbeds }: CommandBarProps) {
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

  const handleExport = () => {
    const formattedSonglist = songlist
      .map((song) => {
        return `${song.artist} - ${song.title} (${song.releaseYear})`;
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

      // Update the songlist with the new order and releaseYear
      const updatedSonglist = result.reorderedSongs.map((reorderedSong: { artist: string; title: string; releaseYear: number }) => {
        const originalSong = songlist.find(song => song.artist === reorderedSong.artist && song.title === reorderedSong.title);
        return originalSong ? { ...originalSong, releaseYear: reorderedSong.releaseYear } : originalSong;
      });

      setSonglist(updatedSonglist);
      console.log("Songs reordered by AI:", updatedSonglist);
    } catch (error) {
      console.error("Error reordering songs:", error);
    } finally {
      setIsReordering(false);
    }
  };

  const commands = [
    // { name: "Reload", handler: handleReload },
    { name: "Shuffle", handler: handleShuffle },
    { name: "AI reorder", handler: handleAISort },
    { name: "Export", handler: handleExport },
    { name: "Finalize", handler: handleOpenModal },
  ];

  return (
    <div>
      <AppBar sx={{
        position: "relative", borderRadius: '12px', // add rounded corners
        paddingTop: 0
      }}>
        <Box
          sx={{
            display: 'flex',
            overflow: 'hidden', // ensures inner content respects the border radi
          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1, // this makes the left column take the remaining space
              height: '80px', // match the height of the embed box
            }}
          >
            {/* <Box
              sx={{
                height: '50%', // take up half the height
                display: 'flex',
                alignItems: 'flex-end', // Changed from 'left' to 'center' for vertical alignment
                paddingLeft: 4,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                GAME
              </Typography>
            </Box> */}

            <Toolbar
              variant="dense"
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                height: '50%', // take up the other half of the height
              }}
            >
              <Box sx={{ display: 'flex', gap: 3, flexGrow: 1 }}>
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
              </Box>
            </Toolbar>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                GAME
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={1} onChange={(event, newValue) => { }} aria-label="basic tabs example">
                  <Tab label="Item One" />
                  <Tab label="Item Two" />
                  <Tab label="Item Three" />
                </Tabs>
              </Box>
            </Box>
          </Box>
      <Box sx={{ width: '300px', height: '80px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
        {embeds && embeds[0] && (
          <SpotifyPlayer embed={embeds[0]} />
        )}
      </Box>
        </Box>
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
