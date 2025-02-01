// Shared normalization rules for artist and title fields
const ARTIST_NORMALIZATION = `
    TRIM(
        LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(
                                REGEXP_REPLACE(artist,
                                    ',\\\\s*(The|A)\\\\s*$', ''
                                ),
                                '^(The |A )', ''
                            ),
                            '[\'']', ''
                        ),
                        '\\\\s*(f\\.?|ft\\.?|feat\\.?|featuring|and|&).*$', ''
                    ),
                    '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                ),
                '\\\\s+', ' '
            )
        )
    )
`;

const TITLE_NORMALIZATION = `
    TRIM(
        LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(title,
                                ',\\\\s*(The|A)\\\\s*$', ''
                            ),
                            '[\'']', ''
                        ),
                        '^(A |The |An )|\\\\s*\\\\(.*\\\\)', ''
                    ),
                    '[\\\\(\\\\)\\\\?\\\\/,\\.\\\\[\\\\]]', ' '
                ),
                '\\\\s+', ' '
            )
        )
    )
`;

// Function to generate ALTER TABLE query for adding normalized columns
const generateAddNormalizedColumns = (tableName) => `
  ALTER TABLE ${tableName}
  ADD COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (${ARTIST_NORMALIZATION}) STORED,
  ADD COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (${TITLE_NORMALIZATION}) STORED,
  ADD INDEX idx_normalized (normalized_artist, normalized_title)
`;

// Function to generate ALTER TABLE query for updating normalized columns
const generateUpdateNormalizedColumns = (tableName) => [
  `ALTER TABLE ${tableName}
  MODIFY COLUMN normalized_artist VARCHAR(255) GENERATED ALWAYS AS (${ARTIST_NORMALIZATION}) STORED`,
  
  `ALTER TABLE ${tableName}
  MODIFY COLUMN normalized_title VARCHAR(255) GENERATED ALWAYS AS (${TITLE_NORMALIZATION}) STORED`
];

module.exports = {
  ARTIST_NORMALIZATION,
  TITLE_NORMALIZATION,
  generateAddNormalizedColumns,
  generateUpdateNormalizedColumns
};
