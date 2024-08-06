const fs = require('fs');
const csv = require('csv-parser');
const csvrw = require('csv');
const _ = require('lodash');
// const TSVDataSource = require('./dataSources');

// eventually will replace with SQL - SELECT * FROM songs WHERE year = ? AND played = 0 ORDER BY RAND() LIMIT 1;

function processData(source) {
  const data = source.readData();
  console.log("Data:", data);

  source.updateData('some_id', ['new_value1', 'new_value2']);
}

// might need something like this:
// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents#active_learning_a_dynamic_shopping_list

// const tsvSource = new TSVDataSource('data.tsv');

// processData(tsvSource);

// update the tsv file with the new data
// add song to the played list
function markPlayed(year, index) {
    // Define the path to the TSV file
    const tsvPath = `import/billboard/${year}.tsv`;

    // Read the TSV file
    const tsvData = fs.readFileSync(tsvPath, 'utf-8');

    // Parse the TSV data
    csvrw.parse(tsvData, { delimiter: '\t', columns: true }, (err, records) => {
        if (err) {
            console.error(err);
            return;
        }

        // Find the song and update the "Played" field
        for (let record of records) {
            if (record[""] === index) {
                record['Played'] = 1;
                break;
            }
        }

        // Stringify the updated data
        csvrw.stringify(records, { header: true, delimiter: '\t' }, (err, output) => {
            if (err) {
                console.error(err);
                return;
            }

            // Write the updated data back to the TSV file
            fs.writeFileSync(tsvPath, output);
        });
    });
}

function neverPlay(year, index) {
    // Define the path to the TSV file
    const tsvPath = `import/billboard/${year}.tsv`;

    // Read the TSV file
    const tsvData = fs.readFileSync(tsvPath, 'utf-8');

    console.log(`song id: ${index}`)
    // Parse the TSV data
    csvrw.parse(tsvData, { delimiter: '\t', columns: true }, (err, records) => {
        if (err) {
            console.error(err);
            return;
        }

        // Find the song and update the "Played" field
        for (let record of records) {
            console.log(`record[""]: ${record[""]}`)
            if (record[""] === index) {
                record['Played'] = -1;
                break;
            }
        }

        // Stringify the updated data
        csvrw.stringify(records, { header: true, delimiter: '\t' }, (err, output) => {
            if (err) {
                console.error(err);
                return;
            }

            // Write the updated data back to the TSV file
            fs.writeFileSync(tsvPath, output);
        });
    });
}

function getSong(year) {
    return new Promise((resolve, reject) => {
        let selectedSong = null;
        let lineCount = 0;

        fs.createReadStream(`import/billboard/${year}.tsv`)
            .pipe(csv({ separator: '\t' }))
            .on('data', (data) => {
                // Reservoir sampling algorithm: choose a random sample of k items from a list of n items, where n is either a large or unknown number, by iterating through the list and at each item, selecting it with a probability of k/currentIndex to be part of the sample
                // Only consider songs that have not been played yet
                if (data.Played == 0) {
                    lineCount++;
                    // Select the current song with a probability of 1/lineCount
                    if (Math.random() < 1 / lineCount) {
                        selectedSong = data;
                    }
                }
            })
            .on('end', () => {
                if (selectedSong) {
                    selectedSong.Year = year;
                    resolve(selectedSong);
                } else {
                    reject('No song found');
                }
            })
            .on('error', reject);
    });
}

async function replace_song(year) {
    let song = await getSong(year)
    console.log(`new song: ${song}`)
    return song
}

async function createRound() {
    let round = []
    
    round.push(await getSong(_.random(1960, 1979))) // 60s-70s
    round.push(await getSong(_.random(1960, 1979))) // 60s-70s
    round.push(await getSong(_.random(1980, 1989))) // 80s
    round.push(await getSong(_.random(1980, 1989))) // 80s
    round.push(await getSong(_.random(1990, 1999))) // 90s
    round.push(await getSong(_.random(1990, 1999))) // 90s
    round.push(await getSong(_.random(2000, 2009))) // 00s
    round.push(await getSong(_.random(2000, 2009))) // 00s
    round.push(await getSong(_.random(2010, 2023))) // 10s-20s
    round.push(await getSong(_.random(2010, 2023))) // 10s-20s

    // return _shuffle(round);
    return round;
}

module.exports = {
    getSong,
    createRound,
    neverPlay,
    markPlayed
};