import json
import re
from datetime import datetime

def get_earliest_year_from_dates(file_path):
    # Load the JSON file
    with open(file_path, 'r') as file:
        data = json.load(file)

    # Regular expression to match dates in the format yyyy-mm-dd
    date_pattern = re.compile(r'\b\d{4}-\d{2}-\d{2}\b')
    
    # Extract all matching dates
    dates = []
    json_str = json.dumps(data)  # Convert JSON data to a string for regex processing
    for match in date_pattern.findall(json_str):
        try:
            date_obj = datetime.strptime(match, '%Y-%m-%d')
            dates.append(date_obj)
        except ValueError:
            continue

    if not dates:
        return None

    # Sort the dates and return the year of the earliest one
    earliest_date = min(dates)
    return earliest_date.year

# Example usage
if __name__ == "__main__":
    file_path = 'musicbrainzapi.json'  # Replace with your file path
    earliest_year = get_earliest_year_from_dates(file_path)
    
    if earliest_year:
        print(f"The earliest year is: {earliest_year}")
    else:
        print("No valid dates found in the file.")
