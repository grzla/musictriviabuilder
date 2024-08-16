"use client";
import * as React from "react";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import BasicList from "../components/BasicList";
import CommandBar from "../components/CommandBar";
import SearchBar from "../components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchPanel from "@/components/SearchPanel";
import { Box, CircularProgress, Grid, Paper } from "@mui/material";
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
  const [isLoading, setIsLoading] = React.useState(true);

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
          <Item sx={{ flexGrow: "6" }}>
            <CommandBar />
            {isLoading ? (
              <CircularProgress />
            ) : (
              <BasicList songlist={songlist} />
            )}
          </Item>
          <Item sx={{ flexGrow: "3", width: "500px" }}>
            {/* <SearchBar /> */}
            {/* <SearchResults /> */}
            <SearchPanel />
          </Item>
        </Grid>
      </Box>
    </main>
  );
}
