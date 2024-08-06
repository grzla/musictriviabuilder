import * as React from "react";
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
import { testSongs } from "../lib/utils.js";
import { Item } from "../typings";

interface Song {
  id: string;
  artist: string;
  title: string;
  year: number;
  rank?: number;
  releaseYear?: number | null;
}

const BasicList = () => {
  const [songlist, setSonglist] = React.useState(testSongs);

  const deleteSong = (id) => {
    setSonglist(songlist.filter((song) => song.id !== id));
  };

  return (
    <Box>
      <List>
        {songlist.map((song, index) => (
          <ListItem
            key={song.id}
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
