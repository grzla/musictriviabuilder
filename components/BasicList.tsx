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
} from "@mui/material";
import {
  Delete,
  Edit,
  ArrowUpward,
  ArrowDownward,
  Send,
  Email,
} from "@mui/icons-material";

interface BasicListProps {
  songlist: SongParams[];
}

const BasicList: React.FC<BasicListProps> = ({ songlist }) => {
  const [songs, setSongs] = React.useState<SongParams[]>(songlist);

  // Log initial state
  React.useEffect(() => {
    console.log("Initial songs state:", songs);
  }, []);

  const deleteSong = (id: number) => {
    setSongs(songs.filter((song) => song.id !== id));
  };

  return (
    <Box>
      <List>
        {songs.map((song, index) => (
          <ListItem
            key={song.id}
            dense={true}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="move up">
                  <ArrowUpward />
                </IconButton>
                <IconButton edge="end" aria-label="move down">
                  <ArrowDownward />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteSong(song.id)}
                >
                  <Delete />
                </IconButton>
                <IconButton edge="end" aria-label="queue">
                  <Send />
                </IconButton>
                <IconButton edge="end" aria-label="queue">
                  <Email />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={song.title}
              secondary={`${song.artist} | Rank: ${song.rank}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BasicList;
