import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { testSongs } from "../lib/utils.js";

const ItemType = "song";

const DraggableSongItem = ({ song, index, moveSong }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveSong(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { type: ItemType, id: song.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <li ref={ref} style={{ opacity: isDragging ? 0 : 1 }} className="song-item">
      <div className="rank">{song.rank}</div>
      <div className="artist">{song.artist}</div>
      <div className="title">{song.title}</div>
      {/* Buttons here */}
    </li>
  );
};

const Test4 = () => {
  const [songlist, setSonglist] = useState(testSongs);

  const moveSong = (dragIndex, hoverIndex) => {
    const dragSong = songlist[dragIndex];
    const newSonglist = [...songlist];
    newSonglist.splice(dragIndex, 1);
    newSonglist.splice(hoverIndex, 0, dragSong);
    setSonglist(newSonglist);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>Music Trivia</div>
      <ul>
        <li className="song-item header">
          <div className="rank">Rank</div>
          <div className="artist">Artist</div>
          <div className="title">Title</div>
          <div className="buttons">Actions</div>
        </li>
        {songlist.map((song, index) => (
          <DraggableSongItem
            key={song.id}
            song={song}
            index={index}
            moveSong={moveSong}
          />
        ))}
      </ul>
    </DndProvider>
  );
};

export default Test4;
