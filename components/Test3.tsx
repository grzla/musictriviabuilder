import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { testSongs } from "../lib/utils.js";

const Test3 = () => {
  const [songlist, setSonglist] = useState(testSongs);

  const deleteSong = (id) => {
    setSonglist(songlist.filter((song) => song.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(songlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSonglist(items);
  };

  return (
    <>
      <div>Music Trivia</div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="songs">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {songlist.map((song, index) => (
                <Draggable
                  key={song.id}
                  draggableId={song.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <li
                      className="song-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {" "}
                      TEST
                      <div className="rank">{song.rank}</div>
                      <div className="artist">{song.artist}</div>
                      <div className="title">{song.title}</div>
                      <div className="buttons">
                        <button>Edit</button>
                        <button onClick={() => deleteSong(song.id)}>
                          Delete
                        </button>
                        <button>Up</button>
                        <button>Down</button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default Test3;
