# Music Trivia Builder

Next.js productivity app for a local client in the entertainment space who offers an IRL Music Trivia game. The game includes a 'Name That Tune' round (name the artist and title) and a 'Decades' round (name the decade the song was released). This utility simplifies the creation of the lists by qualifying the song selection, accurately retrieving release years, in-browser previews via Spotify, and export of the final lists. These lists are ultimately delivered to a host who runs the game in person.

On load, Billboard Top 100 tracks going back to the 1950s are selected and checked against the company's internal media library, previously used songs, and a do not play list. Ten tracks are presented, color coded green to confirm they are found in the library or red if they are not. Match accuracy to library is about 98% but occasionally there will be an odd case where the track is in fact in the library under some alternate spelling. The other reason non-library songs are presented is to backfill the library with suggested songs. 

Each song has several buttons available:

- **Copy to clipboard:** Copy {Artist - Title} to clipboard. 
- **Replace:** Replace the song with another one from the same decade. (Guaranteed to be in library.)
- **Do not play:** Add song to Do Not Play list. These will not be displayed to the user again.
- **Add to requests:** Add song to Requests list. (Flag songs not in the library which should be.)
- **Delete:** Remove song from list.
- **Send to other list:** Move the song to the [Decades/NameThatTune] list and replace it in the current list.


## Tech 

- Next.js 14
- TypeScript
- MySQL Database
- Tailwind CSS
- Server Actions
- dnd-kit (drag and drop list items)
- Spotify API integration (preview player)
- OpenAI assistant API integration (accurate release date retrieval)
