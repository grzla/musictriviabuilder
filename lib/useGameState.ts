import React from 'react';
import { SongParams, GameCat } from '@/types';

// Manage game state
function useGameState() {

    const [gameNum, setGameNum] = React.useState<number>(49);
    const [currentRound, setCurrentRound] = React.useState<GameCat>("namethattune");
    const [songlist, setSonglist] = React.useState<{
        [key in GameCat]: SongParams[]
    }>({
        namethattune: [],
        decades: []
    });
    const [searchResults, setSearchResults] = React.useState<SongParams[]>([]);

    // Optionally, add functions to update the state
    const resetGame = () => {
        setCurrentRound("namethattune");
        setGameNum(49);
    };

    const queueToSonglist = (song: SongParams, cat: GameCat = "decades") => {
        setSonglist((prevSonglist) => ({
            ...prevSonglist,
            [cat]: [...prevSonglist[cat], song]
        }));
    };

    return {
        gameNum,
        setGameNum,
        currentRound,
        setCurrentRound,
        songlist,
        setSonglist,
        searchResults,
        setSearchResults,
        queueToSonglist,
    };
}

export default useGameState;
