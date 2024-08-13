// import { GetServerSideProps } from "next";
"use server";
import { SongParams } from "@/types/index"; // Adjust the import path as necessary

// This is a Server Component
const fetchSongs = async (): Promise<SongParams[]> => {
  const res = await fetch("http://localhost:3000/api/round", {
    // This ensures the fetch request happens on the server
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch songs");
  }
  // console.log(`response json: ${JSON.stringify(res.json())}`);
  return res.json();
};

const RoundPage = async () => {
  const songs = await fetchSongs();

  return (
    <div>
      <h1>Random Songs</h1>
      {songs.length > 0 ? (
        <ul>
          {songs.map((song, index) => (
            <li key={index}>
              <p>
                <strong>Title:</strong> {song.title}
              </p>
              <p>
                <strong>Artist:</strong> {song.artist}
              </p>
              <p>
                <strong>Year:</strong> {song.year}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No songs found.</p>
      )}
    </div>
  );
};

export default RoundPage;
