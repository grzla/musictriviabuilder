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

// Fetch songs from the API
const fetchSongs = async (): Promise<SongParams[]> => {
  const res = await fetch("/api/round", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch songs");
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Expected JSON response");
  }

  return res.json();
};

interface BasicListProps {
  songlist: SongParams[];
}

const BasicList: React.FC<BasicListProps> = ({ songlist }) => {
  const [songs, setSongs] = React.useState<SongParams[]>(songlist);

  const deleteSong = (id: number) => {
    setSongs(songs.filter((song) => song.id !== id));
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
