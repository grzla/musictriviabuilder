import xml.etree.ElementTree as ET
import csv

def import_songs(xml_file):
    # Parse the XML file
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # List to hold songs
    songs = []

    # Traverse the XML tree
    for song in root.findall('.//Song'):
        file_path = song.get('FilePath')
        tags = song.find('Tags')

        if tags is not None:
            artist = tags.get('Author')
            title = tags.get('Title')
            year = tags.get('Year')
            genre = tags.get('Genre')

        else:
            artist = None
            title = None

        # Add the song to the list
        songs.append({
            'Artist': artist,
            'Title': title,
            'Year': year,
            'Genre': genre,
            'FilePath': file_path
        })

    return songs


def export_songs(songs, tsv_file):
    # Open the TSV file
    with open(tsv_file, 'w', newline='') as f:
        writer = csv.writer(f, delimiter='\t')

        # Write the header row
        writer.writerow(['Artist', 'Title', 'Release Year'])

        # Write the songs to the TSV file
        for song in songs:
            # Check if all values in the song dictionary are None
            # if not all(value is None for value in song.values()):
            if song['Artist'] is not None and song['Title'] is not None:
                writer.writerow([song['Artist'], song['Title'], song['Year']])


# Call the functions
# songs = import_songs('database_sample.xml')
songs = import_songs('import/database.xml')
export_songs(songs, 'librarySongs.tsv')
print(songs)