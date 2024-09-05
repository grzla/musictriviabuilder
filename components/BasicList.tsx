import * as React from "react";
import { SongParams } from "@/types";
import { Box, CircularProgress, List, ListItem, ListItemText, IconButton, Tooltip } from "@mui/material";
import { AddTask, Autorenew, Attachment, Check, ContentPaste, Delete, DoNotDisturb, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { GameCat } from "@/types/index.js";



interface BasicListProps {
  songlist: {
    [key in GameCat]: SongParams[]
  };
  setSonglist: React.Dispatch<React.SetStateAction<{
    [key in GameCat]: SongParams[]
  }>>;
  searchResults: SongParams[];
  setSearchResults: React.Dispatch<React.SetStateAction<SongParams[]>>;
  currentRound: GameCat;
  embeds: string[];
  setEmbeds: React.Dispatch<React.SetStateAction<string[]>>;
}

const BasicList: React.FC<BasicListProps> = ({
  songlist,
  setSonglist,
  searchResults,
  setSearchResults,
  currentRound,
  embeds,
  setEmbeds
}) => {
  const [selectedItem, setSelectedItem] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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
  React.useEffect(() => {
    const confirmSongsInLibrary = async () => {
      try {
        const rounds: GameCat[] = ['namethattune', 'decades'];
        const updatedSonglist = { ...songlist };

        for (const round of rounds) {
          const songsWithLibraryStatus = await Promise.all(
            songlist[round].map(async (song) => ({
              ...song,
              inLibrary: await checkSongInLibrary(song),
            }))
          );

          updatedSonglist[round] = songsWithLibraryStatus;
        }

        setSonglist(updatedSonglist);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    confirmSongsInLibrary();
  }, []);

  const checkSongInLibrary = async (song: SongParams) => {
    try {
      const response = await fetch("/api/matchsongtolibrary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(song),
      });

      if (response.ok) {
        const matches = await response.json();
        return matches.length > 0;
      } else {
        console.error("Error fetching library matches:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Error fetching library matches:", error);
      return false;
    }
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return; // Can't move the first item up
    setSonglist((prevSonglist) => {
      const newSongs = [...prevSonglist[currentRound]];
      [newSongs[index - 1], newSongs[index]] = [
        newSongs[index],
        newSongs[index - 1],
      ];
      return {
        ...prevSonglist,
        [currentRound]: newSongs
      };
    });
  };

  const moveItemDown = (index: number) => {
    setSonglist((prevSonglist) => {
      if (index === prevSonglist[currentRound].length - 1) return prevSonglist; // Can't move the last item down
      const newSongs = [...prevSonglist[currentRound]];
      [newSongs[index + 1], newSongs[index]] = [
        newSongs[index],
        newSongs[index + 1],
      ];
      return {
        ...prevSonglist,
        [currentRound]: newSongs
      };
    });
  };

  const replaceSong = async (song: SongParams) => {
    try {
      const { year, id } = song;
      const response = await fetch(`/api/song?year=${year}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      const newSong = responseData[0];

      if (!newSong || !newSong.id) {
        throw new Error("Invalid song object returned from the API");
      }

      const inLibrary = await checkSongInLibrary(newSong);
      newSong.inLibrary = inLibrary;

      setSonglist((prevSonglist) => {
        const songIndex = prevSonglist[currentRound].findIndex((s) => s.id === id);
        if (songIndex === -1) {
          console.log(`Song with ID ${id} not found in the list.`);
          return prevSonglist;
        }
        const updatedSongs = [...prevSonglist[currentRound]];
        updatedSongs[songIndex] = newSong;

        // Fetch new embed for the replaced song
        fetch("/api/fetchpreviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([newSong]),
        })
          .then((response) => response.json())
          .then((data) => {
            setEmbeds((prevEmbeds) => {
              const newEmbeds = [...prevEmbeds];
              newEmbeds[songIndex] = data.embeds[0];
              return newEmbeds;
            });
          })
          .catch((error) => {
            console.error("Failed to fetch new Spotify embed:", error);
          });

        return {
          ...prevSonglist,
          [currentRound]: updatedSongs
        };
      });
    } catch (error) {
      console.error("Failed to replace song:", error);
    }
  };

  const donotplay = async (song: SongParams) => {
    try {
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
    await replaceSong(song);
  };

  const handleItemClick = async (index: number, song: SongParams) => {
    setSelectedItem(index);
    try {
      const libraryResponse = await fetch("/api/matchsongtolibrary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });

      if (libraryResponse.ok) {
        const libMatches = await libraryResponse.json();
        setSearchResults(libMatches);
      } else {
        console.error("Error fetching library matches:", libraryResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDoubleClick = async (song: SongParams) => {
    try {
      const response = await fetch("/api/fetchpreviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([song]),
      });

      if (response.ok) {
        const data = await response.json();
        setEmbeds((prevEmbeds) => {
          const newEmbeds = [...prevEmbeds];
          newEmbeds[0] = data.embeds[0];
          return newEmbeds;
        });
        console.log('Fetched previews:', data);
      } else {
        console.error('Error fetching previews:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching previews:', error);
    }
  };

  const confirmInLibrary = (index: number) => {
    setSonglist((prevSongs) => {
      const updatedSongs = { ...prevSongs };
      updatedSongs[currentRound] = updatedSongs[currentRound].map((song, i) =>
        i === index ? { ...song, inLibrary: true } : song
      );
      return updatedSongs;
    });
  };

  const deleteSong = (index: number) => {
    setSonglist((prevSonglist) => {
      const updatedSongs = { ...prevSonglist };
      updatedSongs[currentRound] = updatedSongs[currentRound]
        .filter((_, i) => i !== index);
      return updatedSongs;
    });
  };

  const addToRequests = async (song: SongParams) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Request successful:", data);
    } catch (error) {
      console.error("Error requesting song:", error);
    }
    await replaceSong(song);
  };

  const copyToClipboard = (song: SongParams) => {
    if (!song) return;

    const artist = song.artist || "Unknown Artist";
    const title = song.title || "Unknown Title";
    const textToCopy = `${artist} - ${title}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log("Copied to clipboard:", textToCopy);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const sendSongToList = async (index: number) => {
    setSonglist((prevSonglist) => {
      const updatedSongs = { ...prevSonglist };
      const songToSend = updatedSongs[currentRound][index];
      // Add the song to the opposite round, but only if it's not already there
      const oppositeRound = currentRound === 'namethattune' ? 'decades' : 'namethattune';
      if (!updatedSongs[oppositeRound].some(song => song.id === songToSend.id)) {
        updatedSongs[oppositeRound].push(songToSend);
      }
      return updatedSongs;
    });
    // Call replaceSong with the song that was sent to the other list
    await replaceSong(songlist[currentRound][index]);
  };
  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <List>
        {songlist[currentRound].map((song, index) => (
          <ListItem
            key={`${song.id}-${index}`}
            dense
            onClick={() => handleItemClick(index, song)}
            onDoubleClick={() => handleDoubleClick(song)}
            style={{
              backgroundColor: song.inLibrary ? "lightgreen" : "lightcoral",
            }}
            secondaryAction={
              <>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    edge="end"
                    aria-label="copy"
                    onClick={() => copyToClipboard(song)}
                  >
                    <ContentPaste />
                  </IconButton>
                </Tooltip>
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
                    aria-label="replace"
                    onClick={() => replaceSong(song)}
                  >
                    <Autorenew />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Confirm in library">
                  <IconButton
                    edge="end"
                    aria-label="confirm"
                    onClick={() => confirmInLibrary(index)}
                  >
                    <Check />
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
                  <IconButton
                    edge="end"
                    aria-label="queue"
                    onClick={() => addToRequests(song)}
                  >
                    <AddTask />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from list">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteSong(index)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Send to other list">
                  <IconButton
                    edge="end"
                    aria-label="Send"
                    onClick={() => sendSongToList(index)}
                  >
                    <Attachment />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <Box
              sx={{
                minWidth: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.5)', // 50% transparent white
                color: '555555',
                borderRadius: '5px',
                marginRight: '16px',
                paddingTop: '3px',
                fontSize: '20px', // Increased font size
                userSelect: 'none',
              }}
            >
              {index + 1}
            </Box>
            <div style={{ flex: 1, userSelect: 'none' }}>
              <ListItemText
                primary={song.title ?? "∅"}
                secondary={`${song.artist ?? "∅"} | ${song.ranking ?? "∅"} | ${song.year ?? "∅"
                  } | ${song.releaseYear ?? "∅"}`}
              />
            </div>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BasicList;
