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
  const [embeds, setEmbeds] = React.useState<string[]>([]);

  // Fetch embeds when songlist changes
  /*
  React.useEffect(() => {
    const fetchEmbeds = async () => {
      try {
        const response = await fetch("/api/fetchpreviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(songlist),
        });

        const data = await response.json();
        setEmbeds(data.embeds);
      } catch (error) {
        console.error("Failed to fetch Spotify embeds:", error);
      }
    };

    fetchEmbeds();
  }, [songlist]);
  */

  const moveItemUp = (index: number) => {
    if (index === 0) return; // Can't move the first item up
    setSonglist((prevSongs) => {
      const newSongs = [...prevSongs];
      [newSongs[index - 1], newSongs[index]] = [
        newSongs[index],
        newSongs[index - 1],
      ];
      console.log("Songs after moving up:", newSongs);
      return newSongs;
    });
  };

  const moveItemDown = (index: number) => {
    setSonglist((prevSongs) => {
      if (index === prevSongs.length - 1) return prevSongs; // Can't move the last item down
      const newSongs = [...prevSongs];
      [newSongs[index + 1], newSongs[index]] = [
        newSongs[index],
        newSongs[index + 1],
      ];
      console.log("Songs after moving down:", newSongs);
      return newSongs;
    });
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

  const donotplay = async (song: SongParams) => {
    try {
      // const { artist, title, id } = song;

      const response = await fetch("/api/donotplay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song }),
      });
    } catch (error) {
      console.error("Failed to add song to do-not-play list:", error);
    }
    // Logic to get the new song

    // Add the song to the donotplay list

    // Call replaceSong to handle the replacement logic
    await replaceSong(song);
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
                    aria-label="ban"
                    onClick={() => donotplay(song)}
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
              secondary={`${song.artist} | ${song.ranking} | ${song.year} | ${song.releaseYear}`}
            />
            <div dangerouslySetInnerHTML={{ __html: embeds[index] || "" }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BasicList;
