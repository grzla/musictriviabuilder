// update to use UUID

const mysql = require('mysql2');
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' });
// dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');
});

const queryImportLibrary = `
  LOAD DATA INFILE '/home/greg/Documents/wrikMusicTrivia/librarySongs.tsv'
  INTO TABLE librarysongs
  FIELDS TERMINATED BY '\t' 
  LINES TERMINATED BY '\n'
  IGNORE 1 ROWS
  (Artist, Title, Year);
`;

const queryImportBillboard = `
  LOAD DATA INFILE '/home/greg/Documents/wrikMusicTrivia/import/billboard/1983.tsv'
  INTO TABLE billboard
  FIELDS TERMINATED BY '\t' 
  LINES TERMINATED BY '\n'
  IGNORE 1 ROWS
  (@dummy, Ranking, Artist, Title, Played);
`;

const queryCreateBillboardTable = `
CREATE TABLE billboardsongs (
    id INT AUTO_INCREMENT,
    ranking SMALLINT,
    artist VARCHAR(255),
    title VARCHAR(255),
    year SMALLINT,
    PRIMARY KEY (id)
  );`

const queryDropBillboardTable = `
DROP TABLE billboard;`

const submitQuery = query => connection.query(query, (err, result) => {
  if (err) throw err;
  console.log('Data imported successfully.');
});

submitQuery(queryCreateBillboardTable);

// submitQuery(queryImportLibrary);
// submitQuery(queryImportBillboard);
/**
CREATE DATABASE musictriviatest;

USE musictriviatest;


CREATE TABLE billboard (
  id INT AUTO_INCREMENT,
  Artist VARCHAR(100),
  Title VARCHAR(100),
  Year SMALLINT,
  PRIMARY KEY (id)
);
CREATE TABLE librarysongs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    year INT,
    rank INT,
    genre VARCHAR(20),
    releaseYear INT,
    bpm VARCHAR(20)
    played DATE,
    isInLibrary BOOLEAN DEFAULT FALSE,
    neverPlay BOOLEAN DEFAULT FALSE,
    FULLTEXT(artist, title)
) ENGINE=InnoDB;
 
SELECT * FROM Songs
WHERE MATCH(artist, title) AGAINST('+Nirvana' IN BOOLEAN MODE);

---> LOAD LIBRARYSONGS.TSV INTO TABLE

-- Create normalized versions of your columns
ALTER TABLE librarysongs ADD COLUMN Title_normalized VARCHAR(100);
ALTER TABLE librarysongs ADD COLUMN Artist_normalized VARCHAR(100);

UPDATE librarysongs 
SET Artist_normalized = LOWER(REPLACE(REPLACE(artist, '.', ''), ',', '')),
    Title_normalized = LOWER(REPLACE(REPLACE(title, '.', ''), ',', ''));

-- Create full-text indexes
ALTER TABLE librarysongs ADD FULLTEXT(Artist_normalized, Title_normalized);

CREATE TABLE billboard (
  id INT AUTO_INCREMENT,
  Ranking SMALLINT,
  Artist VARCHAR(100),
  Title VARCHAR(100),
  Year SMALLINT,
  ReleaseYear SMALLINT,
  Played TINYINT,
  PRIMARY KEY (id)
);

// set up a trigger to automatically normalize the artist and title columns
DELIMITER //
CREATE TRIGGER BeforeInsertLibrarySongs
// BEFORE UPDATE ON librarysongs
BEFORE INSERT ON librarysongs
FOR EACH ROW
BEGIN
  SET NEW.Artist_normalized = LOWER(REPLACE(REPLACE(NEW.Artist, '.', ''), ',', ''));
  SET NEW.Title_normalized = LOWER(REPLACE(REPLACE(NEW.Title, '.', ''), ',', ''));
END; //
DELIMITER ;

*/