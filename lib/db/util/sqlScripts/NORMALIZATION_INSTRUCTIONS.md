# Song Normalization Scripts

This directory contains scripts for managing normalized song data across database tables. The normalization rules help standardize artist names and song titles for better matching and searching.

## Script Types and When to Use Them

### Initial Setup Scripts
These scripts are for adding normalized columns to tables that don't have them yet:

1. `addNormalizedColumns.js`
   - Adds normalized columns to the billboardsongs table
   - Creates normalized_artist and normalized_title columns
   - Adds necessary indexes
   - Run this when: Setting up the billboard songs table for the first time

2. `addNormalizedToOtherTables.js`
   - Adds normalized columns to other tables (usedsongs, donotplay, requests)
   - Creates the same columns and indexes as above
   - Run this when: Setting up these additional tables for the first time

### Update Scripts
These scripts modify existing normalized columns:

1. `updateNormalizationRules.js`
   - Updates how existing normalized columns are computed
   - Modifies the normalization rules for all tables at once
   - Does NOT create new columns or indexes
   - Run this when: Changing how artist names or song titles should be normalized

### Why Separate Scripts?
We maintain separate scripts for safety and clarity:
- Initial setup vs. updates are different operations with different risks
- Keeps operations atomic and focused
- Easier to troubleshoot if issues occur
- Safer than combining complex ALTER TABLE operations

## Setup

1. Ensure you have a `.env.local` file in the project root with your database credentials:
```
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

2. Make sure you have all required dependencies:
```bash
npm install mysql2 dotenv
```

## Typical Usage Workflow

### First Time Setup
1. Create your tables (using the create*Table.js scripts)
2. Run addNormalizedColumns.js for billboard songs
3. Run addNormalizedToOtherTables.js for other tables

### Updating Normalization Rules
1. Edit the rules in normalizationRules.js
2. Backup your database (see Safety section)
3. Run updateNormalizationRules.js

## Current Normalization Rules

### Artist Names
- Converts to lowercase
- Removes "The" or "A" from the beginning (e.g., "The Beatles" -> "beatles")
- Removes "The" or "A" from the end when followed by a comma (e.g., "Beatles, The" -> "beatles")
- Removes featuring/ft./feat. sections
- Removes special characters
- Trims whitespace

### Song Titles
- Converts to lowercase
- Removes "A", "An", "The" from the beginning
- Removes text in parentheses
- Removes special characters
- Trims whitespace

## Safety First

### Before Any Operations
Always backup your database:
```bash
mysqldump -u your_user -p musictriviabuilder > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Best Practices
1. Always run scripts in this order:
   - Initial setup scripts first (if needed)
   - Update scripts only after confirming columns exist
2. Test changes on a copy of the database first
3. Keep backups for at least a few days
4. Monitor script execution and check results

## Troubleshooting

### Common Issues
1. "Column already exists"
   - This is normal if running setup scripts on existing tables
   - Verify column properties match expectations

2. "Table doesn't exist"
   - Run appropriate create*Table.js script first
   - Check database and table names

3. Permission errors
   - Verify .env.local credentials
   - Ensure user has ALTER TABLE permissions

### Verification
Use these queries to verify normalization:
```sql
SELECT artist, normalized_artist, title, normalized_title 
FROM your_table 
LIMIT 5;
```

For more complex issues:
1. Check the MySQL error log
2. Use debugNormalization.js to test specific cases
3. Verify table structure with DESCRIBE your_table

## Future Improvements
We plan to create a unified management script (manageNormalizedColumns.js) that will:
- Check if columns exist
- Create or update as needed
- Handle all tables in one operation

This is under development and will be thoroughly tested before replacing the current scripts.
