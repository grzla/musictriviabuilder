"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import BasicList from "../components/BasicList";
import CommandBar from "../components/CommandBar";
import SearchPanel from "@/components/SearchPanel";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { SongParams } from "@/types";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function Home() {
  const [songlist, setSonglist] = React.useState<SongParams[]>([]);
  const [searchResults, setSearchResults] = React.useState<SongParams[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [embeds, setEmbeds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/round", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch songs");
        const songs = await res.json();
        setSonglist(songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box>
        <Grid container spacing={0} sx={{ mt: "2px" }}>
          <Item sx={{ flexGrow: "6", width: "800px" }}>
          <CommandBar songlist={songlist} setSonglist={setSonglist} embeds={embeds} setEmbeds={setEmbeds} />
            {isLoading ? (
              <CircularProgress />
            ) : (
              <BasicList
                songlist={songlist}
                setSonglist={setSonglist}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                embeds={embeds}
                setEmbeds={setEmbeds}
              />
            )}
          </Item>
          <Item sx={{ flexGrow: "3", width: "600px" }}>
            {songlist && songlist.length > 0 ? (
              <SearchPanel
                songlist={songlist}
                setSonglist={setSonglist}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
              />
            ) : (
              <Typography variant="body2">Loading songlist...</Typography>
            )}
          </Item>
        </Grid>
      </Box>
    </main>
  );
}
