import pandas as pd

# Read the TSV file into a DataFrame, treating all numeric values as strings
df = pd.read_csv('/home/greg/Documents/wrikMusicTrivia/usedSongs.tsv', sep='\t', dtype=str)

# Swap the first and second column for the first 52 rows
df.iloc[:52, [0, 1]] = df.iloc[:52, [1, 0]].values

# Save the modified DataFrame back to the TSV file
df.to_csv('/home/greg/Documents/wrikMusicTrivia/usedSongs.tsv', sep='\t', index=False)