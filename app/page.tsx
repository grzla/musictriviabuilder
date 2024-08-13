"use client";
import * as React from "react";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import BasicList from "../components/BasicList";
import CommandBar from "../components/CommandBar";
import SearchBar from "../components/SearchBar";
import SearchResults from "@/components/SearchResults";
import SearchPanel from "@/components/SearchPanel";
import { Box, Grid, Paper } from "@mui/material";
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

  React.useEffect(() => {
    const fetchSongs = async () => {
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

    const getSongs = async () => {
      try {
        const songs = await fetchSongs();
        setSonglist(songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    getSongs();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box>
        <Grid container spacing={0} sx={{ mt: "2px" }}>
          <Item sx={{ flexGrow: "6" }}>
            <CommandBar />
            <BasicList songlist={songlist} />
          </Item>
          <Item sx={{ flexGrow: "3" }}>
            {/* <SearchBar /> */}
            {/* <SearchResults /> */}
            <SearchPanel />
          </Item>
        </Grid>
      </Box>
    </main>
  );
}
