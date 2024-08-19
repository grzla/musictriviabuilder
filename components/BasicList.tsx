"use client";

import * as React from "react";
import { SongParams } from "@/types";
import { styled } from "@mui/material/styles";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  AddTask,
  Autorenew,
  Delete,
  DoNotDisturb,
  Edit,
  ArrowUpward,
  ArrowDownward,
  Send,
  Email,
} from "@mui/icons-material";

interface BasicListProps {
  songlist: SongParams[];
  setSonglist: React.Dispatch<React.SetStateAction<SongParams[]>>;
}

const BasicList: React.FC<BasicListProps> = ({ songlist, setSonglist }) => {
  const [songs, setSongs] = React.useState<SongParams[]>(songlist);

  // Log initial state
  React.useEffect(() => {
    console.log("Initial songs state:", songs);
  }, []);

  const moveItemUp = (index: number) => {
    if (index === 0) return; // Can't move the first item up
    const newSongs = [...songs];
    [newSongs[index - 1], newSongs[index]] = [
      newSongs[index],
      newSongs[index - 1],
    ];
    setSonglist(newSongs);
  };

  const moveItemDown = (index: number) => {
    if (index === songs.length - 1) return; // Can't move the last item down
    const newSongs = [...songs];
    [newSongs[index + 1], newSongs[index]] = [
      newSongs[index],
      newSongs[index + 1],
    ];
    setSonglist(newSongs);
  };

  const deleteSong = (id: number) => {
    setSonglist(songs.filter((song) => song.id !== id));
  };

  const replaceSong = async (song: SongParams) => {
    try {
      // Extract the year and id from the song parameter
      const { year, id } = song;

      // Call the api/song endpoint with the song's year using fetch
      const response = await fetch(`/api/song?year=${year}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      const newSong = responseData["0"];

      // Ensure the newSong object has the necessary properties
      if (!newSong || !newSong.id) {
        throw new Error("Invalid song object returned from the API");
      }

      // Update the songlist state with the new song
      setSonglist((prevSongs) => {
        const songIndex = prevSongs.findIndex((s) => s.id === id);
        if (songIndex === -1) {
          console.log(`Song with ID ${id} not found in the list.`);
          return prevSongs; // If the song is not found, return the previous state
        }
        const updatedSongs = [...prevSongs];
        updatedSongs[songIndex] = newSong;
        console.log("Updated songs list:", updatedSongs);
        return updatedSongs;
      });
    } catch (error) {
      console.error("Failed to replace song:", error);
    }
  };

  return (
    <Box>
      <List>
        {songlist.map((song, index) => (
          <ListItem
            key={`${song.id}-${index}`}
            dense={true}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="move up"
                  onClick={() => moveItemUp(index)}
                >
                  <ArrowUpward />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="move down"
                  onClick={() => moveItemDown(index)}
                >
                  <ArrowDownward />
                </IconButton>
                <Tooltip title="Replace">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => replaceSong(song)}
                  >
                    <Autorenew />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Do not play">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteSong(song.id)}
                  >
                    <DoNotDisturb />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add to requests">
                  <IconButton edge="end" aria-label="queue">
                    <AddTask />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <ListItemText
              primary={song.title}
              secondary={`${song.artist} | Rank: ${song.ranking}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BasicList;
