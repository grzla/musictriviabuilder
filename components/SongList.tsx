import React, { useState } from "react";
// import { Item } from "../typings";
import { testSongs } from "../lib/utils.js";
import DraggableList from "./DraggableList.tsx";
import DraggableListItem from "./BasicList.tsx";

const SongList = () => {
  const [songlist, setSonglist] = useState(testSongs);

  const deleteSong = (id) => {
    setSonglist(songlist.filter((song) => song.id !== id));
  };

  return (
    <>
      <div>Music Trivia</div>
      <div>
        <ul>
          <li className="song-item header">
            <div className="rank">Rank</div>
            <div className="artist">Artist</div>
            <div className="title">Title</div>
            <div className="buttons">Actions</div>
          </li>
          {songlist.map((song, index) => (
            <li key={song.id} className="song-item">
              <div className="rank">{song.rank}</div>
              <div className="artist">{song.artist}</div>
              <div className="title">{song.title}</div>
              <div className="buttons">
                <button>Edit</button>
                <button onClick={() => deleteSong(song.id)}>Delete</button>
                <button>Up</button>
                <button>Down</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SongList;
