import * as React from "react";
import { SongParams } from "@/types";
import { Box, List, ListItem, ListItemText, IconButton, Tooltip } from "@mui/material";
import dynamic from 'next/dynamic';

const CircularProgress = dynamic(
  () => import('@mui/material/CircularProgress'),
  { ssr: false }
);
import { AddTask, Autorenew, Attachment, Check, ContentPaste, Delete, DoNotDisturb, SearchOff } from "@mui/icons-material";
import { GameCat } from "@/types/index.js";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlaylistProps {
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

interface SortableItemProps extends Omit<PlaylistProps, 'songlist' | 'setSonglist'> {
  song: SongParams;
  index: number;
  handleItemClick: (index: number, song: SongParams) => void;
  handleDoubleClick: (song: SongParams) => void;
  logSearchMismatch: (song: SongParams) => Promise<void>;
  copyToClipboard: (song: SongParams) => void;
  replaceSong: (song: SongParams) => Promise<void>;
  donotplay: (song: SongParams) => Promise<void>;
  addToRequests: (song: SongParams) => Promise<void>;
  deleteSong: (index: number) => void;
  sendSongToList: (index: number) => Promise<void>;
}

function SortableItem({ song, index, ...props }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
    backgroundColor: song.inLibrary ? "lightgreen" : "lightcoral",
    margin: '1px 0',
    borderRadius: '6px',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : 'none',
    '&:hover': {
      backgroundColor: song.inLibrary ? "#90EE90" : "#F08080",
    },
  };

  return (
    <ListItem
      onClick={(e) => props.handleItemClick(index, song)}
      onDoubleClick={(e) => props.handleDoubleClick(song)}
      sx={style}
      secondaryAction={
        <div>
          <Tooltip title="Copy to clipboard">
            <IconButton
              edge="end"
              aria-label="copy"
              onClick={(e) => {
                e.stopPropagation();
                props.copyToClipboard(song);
              }}
            >
              <ContentPaste />
            </IconButton>
          </Tooltip>
          <Tooltip title="Replace">
            <IconButton
              edge="end"
              aria-label="replace"
              onClick={(e) => {
                e.stopPropagation();
                props.replaceSong(song);
              }}
            >
              <Autorenew />
            </IconButton>
          </Tooltip>
          <Tooltip title="Log search mismatch">
            <IconButton
              edge="end"
              aria-label="search mismatch"
              onClick={(e) => {
                e.stopPropagation();
                props.logSearchMismatch(song);
              }}
            >
              <SearchOff />
            </IconButton>
          </Tooltip>
          <Tooltip title="Do not play">
            <IconButton
              edge="end"
              aria-label="ban"
              onClick={(e) => {
                e.stopPropagation();
                props.donotplay(song);
              }}
            >
              <DoNotDisturb />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add to requests">
            <IconButton
              edge="end"
              aria-label="queue"
              onClick={(e) => {
                e.stopPropagation();
                props.addToRequests(song);
              }}
            >
              <AddTask />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove from list">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation();
                props.deleteSong(index);
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send to other list">
            <IconButton
              edge="end"
              aria-label="Send"
              onClick={(e) => {
                e.stopPropagation();
                props.sendSongToList(index);
              }}
            >
              <Attachment />
            </IconButton>
          </Tooltip>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Box
          {...attributes}
          {...listeners}
          ref={setNodeRef}
          data-handle="true"
          sx={{
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            color: '555555',
            borderRadius: '5px',
            marginRight: '16px',
            paddingTop: '3px',
            fontSize: '20px',
            userSelect: 'none',
            cursor: 'grab',
          }}
        >
          {index + 1}
        </Box>
        <ListItemText
          primary={song.title ?? "∅"}
          secondary={`${song.artist ?? "∅"} | ${song.ranking ?? "∅"} | ${song.year ?? "∅"
            } | ${song.releaseYear ?? "∅"}`}
        />
      </div>
    </ListItem>
  );
}

const Playlist: React.FC<PlaylistProps> = ({
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100, // Increased delay to better differentiate between clicks and drags
        tolerance: 5,
        modifiers: [
          (event: { target: EventTarget }) => {
            // Only allow drag to start if the initial click was on the number box
            const target = event.target as HTMLElement;
            return target.getAttribute('data-handle') === 'true';
          },
        ],
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setSonglist((prevSonglist) => {
        const oldIndex = prevSonglist[currentRound].findIndex(
          (song) => song.id.toString() === active.id
        );
        const newIndex = prevSonglist[currentRound].findIndex(
          (song) => song.id.toString() === over.id
        );

        return {
          ...prevSonglist,
          [currentRound]: arrayMove(prevSonglist[currentRound], oldIndex, newIndex),
        };
      });
    }
  };

  // Keep all the existing functions
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

  const replaceSong = async (song: SongParams) => {
    try {
      const { year, id } = song;
      const response = await fetch(`/api/song?year=${year}&libraryOnly=true`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      const newSong = {
        ...responseData[0],
        inLibrary: true // Song is guaranteed to be in library by our optimized query
      };

      if (!newSong || !newSong.id) {
        throw new Error("Invalid song object returned from the API");
      }

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

  const logSearchMismatch = async (song: SongParams) => {
    try {
      const response = await fetch("/api/searchmismatch", {
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
      console.log("Search mismatch logged successfully:", data);
    } catch (error) {
      console.error("Error logging search mismatch:", error);
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={songlist[currentRound].map(song => song.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <List sx={{ width: '100%' }}>
            {songlist[currentRound].map((song, index) => (
              <SortableItem
                key={song.id}
                song={song}
                index={index}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                currentRound={currentRound}
                embeds={embeds}
                setEmbeds={setEmbeds}
                handleItemClick={handleItemClick}
                handleDoubleClick={handleDoubleClick}
                logSearchMismatch={logSearchMismatch}
                copyToClipboard={copyToClipboard}
                replaceSong={replaceSong}
                donotplay={donotplay}
                addToRequests={addToRequests}
                deleteSong={deleteSong}
                sendSongToList={sendSongToList}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default Playlist;
