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
import { GameCat } from "@/types/index.js";

interface CommandBarProps {
  songlist: {
    [key in GameCat]: SongParams[]
  };
  setSonglist: React.Dispatch<React.SetStateAction<{
    [key in GameCat]: SongParams[]
  }>>;
  currentRound: GameCat;
  setCurrentRound: React.Dispatch<React.SetStateAction<GameCat>>;
  embeds: string[];
  setEmbeds: React.Dispatch<React.SetStateAction<string[]>>;
}

// Memoized Embed Component
const SpotifyPlayer = memo(({ embed }: { embed: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: embed }} />;
});

function CommandBar({ songlist, setSonglist, currentRound, setCurrentRound, embeds, setEmbeds }: CommandBarProps) {
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
    console.log("Finalizing both rounds");
    const allSongs = [...songlist.namethattune, ...songlist.decades];
    try {
      const response = await fetch("/api/usedsongs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allSongs),
      });

      if (!response.ok) {
        throw new Error("Failed to finalize songlist for both rounds");
      }

      const result = await response.json();
      console.log("Both rounds finalized:", result);
      setOpen(false)
    } catch (error) {
      console.error("Error finalizing both rounds:", error);
    }
  };

  const handleExport = () => {
    const formattedSonglist = [
      "NAME THAT TUNE",
      ...songlist.namethattune.map(formatSong),
      "",  // Add an empty string for a new line
      "DECADES",
      ...songlist.decades.map(formatSong)
    ].join("\n");

    function formatSong(song: SongParams) {
      const yearInfo = song.releaseYear ? `${song.releaseYear}` : song.year ? `${song.year}` : '';
      return `${song.artist} - ${song.title} (${yearInfo})`;
    }

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
      const currentSongs = [...prevList[currentRound]];
      for (let i = currentSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentSongs[i], currentSongs[j]] = [currentSongs[j], currentSongs[i]];
      }
      return {
        ...prevList,
        [currentRound]: currentSongs
      };
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
        body: JSON.stringify({ songs: songlist[currentRound] }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder songs");
      }

      const result = await response.json();

      // Update the songlist with the new order and releaseYear
      const updatedSonglist = result.reorderedSongs.map((reorderedSong: { artist: string; title: string; releaseYear: number }) => {
        const originalSong = songlist[currentRound].find(song => song.artist === reorderedSong.artist && song.title === reorderedSong.title);
        return originalSong ? { ...originalSong, releaseYear: reorderedSong.releaseYear } : originalSong;
      });

      setSonglist(prevList => ({
        ...prevList,
        [currentRound]: updatedSonglist
      }));
      console.log("Songs reordered by AI:", updatedSonglist);
    } catch (error) {
      console.error("Error reordering songs:", error);
    } finally {
      setIsReordering(false);
    }
  };

  const handleSwitch = () => {
    if (currentRound === 'namethattune') {
      setCurrentRound('decades');
    } else {
      setCurrentRound('namethattune');
    }
  };

  const commands = [
    // { name: "Reload", handler: handleReload },
    { name: currentRound === 'namethattune' ? 'NameThat' : currentRound === 'decades' ? 'Decades' : currentRound, handler: handleSwitch },
    { name: "Shuffle", handler: handleShuffle },
    { name: "AI reorder", handler: handleAISort },
    { name: "Export", handler: handleExport },
    { name: "Finalize", handler: handleOpenModal }
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100px',
          height: '80px',
          borderRadius: '4px',
          marginRight: '16px'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            GAME
          </Typography>
        </Box>
        <Box sx={{ width: '400px', height: '80px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
          <Box>
            {embeds && embeds[0] && (
              <SpotifyPlayer embed={embeds[0]} />
            )}
          </Box>
        </Box>
      </Box>
      <AppBar sx={{
        position: "relative", borderRadius: '12px', // add rounded corners
        paddingTop: 0,
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
                justifyContent: 'space-between',
                // height: '50%',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
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
            Are you sure you want to finalize both songlists?
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
