import { Schema, model, models } from "mongoose";

const LibrarySongSchema = new Schema({
  artist: { type: String, required: false },
  title: { type: String, required: false },
  year: { type: Number, required: false, default: null },
  rank: { type: Number, required: false, default: null },
  releaseYear: { type: Number, required: false, default: null },
  
  // status may contain one of the following values:
  // played, donotplay, null
  status: { type: String, required: false, default: null },

  // datePlayed in yyyy-mm-dd or null
  datePlayed: { type: Date, required: false, default: null },
  normalizedArtist: { type: String, required: false, default: null },
  normalizedTitle: { type: String, required: false, default: null },
  hash: { type: [Number], required: false, default: null }, //minhash array
});


const LibrarySong = models?.LibrarySong || model("LibrarySong", LibrarySongSchema);

export default LibrarySong;