import dynamic from 'next/dynamic';
const CircularProgress = dynamic(
  () => import('@mui/material/CircularProgress'),
  { ssr: false }
);

import * as React from "react";
import { SongParams } from "@/types";
import { Box, List, ListItem, ListItemText, IconButton, Tooltip } from "@mui/material";
import { AddTask, Autorenew, Attachment, Check, ContentPaste, Delete, DoNotDisturb, SearchOff } from "@mui/icons-material";
import { GameCat } from "@/types/index.js";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { deleteSongFromList, sendSongBetweenLists, reorderSongList, SongList } from "@/lib/utils/playlist";
import {
  fetchSongPreviews,
  addSongToDoNotPlay,
  addSongToRequests,
  logSongSearchMismatch,
  replaceSongInYear,
  checkSongInLibrary,
  matchSongToLibrary
} from "@/lib/actions/song.actions";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlaylistProps {
  songlist: SongList;
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

// Guard function to ensure songlist[currentRound] exists
const getSongList = (songlist: SongList, currentRound: GameCat): SongParams[] => {
  return songlist[currentRound] || [];
};

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
    if (!over || active.id === over.id) return;

    const songs = getSongList(songlist, currentRound);
    const oldIndex = songs.findIndex(
      (song) => song.id.toString() === active.id
    );
    const newIndex = songs.findIndex(
      (song) => song.id.toString() === over.id
    );

    setSonglist(prevSonglist => reorderSongList(prevSonglist, currentRound, oldIndex, newIndex));
  };

  React.useEffect(() => {
    const confirmSongsInLibrary = async () => {
      try {
        const rounds: GameCat[] = ['namethattune', 'decades'];
        const updatedSonglist = { ...songlist };

        for (const round of rounds) {
          const songsWithLibraryStatus = await Promise.all(
            getSongList(songlist, round).map(async (song) => ({
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

  const handleItemClick = async (index: number, song: SongParams) => {
    setSelectedItem(index);
    try {
      const matches = await matchSongToLibrary(song);
      setSearchResults(matches);
    } catch (error) {
      console.error("Error fetching library matches:", error);
    }
  };

  const handleDoubleClick = async (song: SongParams) => {
    try {
      const embeds = await fetchSongPreviews([song]);
      setEmbeds(prevEmbeds => {
        const newEmbeds = [...prevEmbeds];
        newEmbeds[0] = embeds[0];
        return newEmbeds;
      });
    } catch (error) {
      console.error('Error fetching previews:', error);
    }
  };

  const replaceSong = async (song: SongParams) => {
    try {
      const newSong = await replaceSongInYear(song);
      const songs = getSongList(songlist, currentRound);
      const songIndex = songs.findIndex((s) => s.id === song.id);
      
      if (songIndex === -1) {
        console.log(`Song with ID ${song.id} not found in the list.`);
        return;
      }

      setSonglist(prevSonglist => {
        const updatedSongs = [...prevSonglist[currentRound]];
        updatedSongs[songIndex] = newSong;
        return {
          ...prevSonglist,
          [currentRound]: updatedSongs
        };
      });

      // Update embed for the replaced song
      const newEmbeds = await fetchSongPreviews([newSong]);
      setEmbeds(prevEmbeds => {
        const updatedEmbeds = [...prevEmbeds];
        updatedEmbeds[songIndex] = newEmbeds[0];
        return updatedEmbeds;
      });
    } catch (error) {
      console.error("Failed to replace song:", error);
    }
  };

  const donotplay = async (song: SongParams) => {
    try {
      await addSongToDoNotPlay(song);
      await replaceSong(song);
    } catch (error) {
      console.error("Failed to process do-not-play request:", error);
    }
  };

  const addToRequests = async (song: SongParams) => {
    try {
      await addSongToRequests(song);
      await replaceSong(song);
    } catch (error) {
      console.error("Failed to process request:", error);
    }
  };

  const sendSongToList = async (index: number) => {
    setSonglist(prevSonglist => sendSongBetweenLists(prevSonglist, currentRound, index));
    const songs = getSongList(songlist, currentRound);
    if (songs[index]) {
      await replaceSong(songs[index]);
    }
  };

  const deleteSong = (index: number) => {
    setSonglist(prevSonglist => deleteSongFromList(prevSonglist, currentRound, index));
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
          items={getSongList(songlist, currentRound).map(song => song.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <List sx={{ width: '100%' }}>
            {getSongList(songlist, currentRound).map((song, index) => (
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
                logSearchMismatch={logSongSearchMismatch}
                copyToClipboard={(song) => copyToClipboard(song.artist, song.title)}
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
