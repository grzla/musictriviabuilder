import { Schema, model, models } from "mongoose";

const SongSchema = new Schema({
  artist: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: false },
  rank: { type: Number, required: false },
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


const Song = models?.Song || model("Song", SongSchema);

export default Song;