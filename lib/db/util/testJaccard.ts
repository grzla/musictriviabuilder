import { estimateJaccardSimilarity } from "../hash";
import Song from "../models/song.model"; // Adjust the import path as necessary
import { connectToDatabase } from "../mongoose";

async function testJaccard() {
    await connectToDatabase();
    // Retrieve the first song from the Songs database
    const song1 = await Song.findOne().exec();
    if (!song1) {
        console.error("Song 1 not found");
        return;
    }

    // Retrieve the second, third, and fourth songs from the Songs database
    const song2 = await Song.findOne().skip(1).exec();
    const song3 = await Song.findOne().skip(2).exec();
    const song4 = await Song.findOne().skip(3).exec();

    if (!song2 || !song3 || !song4) {
        console.error("One or more songs not found");
        return;
    }

    // Extract MinHash signatures
    const sig1 = song1.hash;
    const sig2 = song2.hash;
    const sig3 = song3.hash;
    const sig4 = song4.hash;

    if (!sig1 || !sig2 || !sig3 || !sig4) {
        console.error("One or more songs do not have MinHash signatures");
        return;
    }

    // Calculate and display Jaccard similarities
    const similarity12 = estimateJaccardSimilarity(sig1, sig2);
    const similarity13 = estimateJaccardSimilarity(sig1, sig3);
    const similarity14 = estimateJaccardSimilarity(sig1, sig4);

    console.log(`Jaccard similarity between song1 and song2: ${similarity12}`);
    console.log(`Jaccard similarity between song1 and song3: ${similarity13}`);
    console.log(`Jaccard similarity between song1 and song4: ${similarity14}`);
}

// Call the test function
testJaccard().catch(console.error);