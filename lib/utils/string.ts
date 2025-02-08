/**
 * Normalizes an artist name using the same rules as the database
 * @param artist The artist name to normalize
 * @returns The normalized artist name
 */
export const normalizeArtist = (artist: string): string => {
  return artist
    .toLowerCase()
    // Remove "The" or "A" from end
    .replace(/,\s*(The|A)\s*$/, '')
    // Remove "The" or "A" from beginning
    .replace(/^(The |A )/, '')
    // Remove apostrophes
    .replace(/['']/g, '')
    // Remove featuring artists and anything after 'and'
    .replace(/\s*(\b(f|ft|feat|featuring)\b\.?|\s+and\s+|&).*$/, '')
    // Replace special characters with spaces
    .replace(/[\(\)\?\/,\.\[\]]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalizes a song title using the same rules as the database
 * @param title The song title to normalize
 * @returns The normalized song title
 */
export const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    // Remove "The" or "A" from end
    .replace(/,\s*(The|A)\s*$/, '')
    // Remove apostrophes
    .replace(/['']/g, '')
    // Remove "A", "The", "An" from beginning and anything in parentheses
    .replace(/^(A |The |An )|\s*\(.*\)/, '')
    // Replace special characters with spaces
    .replace(/[\(\)\?\/,\.\[\]]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
};
