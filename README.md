# Scholar Capsule

A time machine for Google Scholar profiles.

## Overview

Scholar Capsule is a web application that allows you to view Google Scholar profiles as they were at any point in time. It uses the `scholarly` Python library to fetch data from Google Scholar and then filters the publications and citations based on the selected date.

## Features

- Search for any Google Scholar author profile
- Adjust the date to see how the profile looked at different points in time
- View publications and citations that existed as of the selected date
- Calculate h-index and i10-index based on the filtered publications
- Responsive design that works on desktop and mobile devices

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Steps

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/scholar-capsule.git
   cd scholar-capsule
   ```

2. Install the required dependencies:
   ```
   pip install scholarly flask
   ```

3. Run the application:
   ```
   cd scholar_capsule
   python app.py
   ```

4. Open your web browser and go to `http://localhost:5000`

## Usage

1. Enter the name of a scholar in the search box
2. Select a date using the date picker
3. Click "Search" to view the scholar's profile as it was on that date
4. The application will display:
   - Basic author information
   - Citation metrics (total citations, h-index, i10-index)
   - Publications that existed as of the selected date
   - Citation counts for each publication (only counting citations that existed as of the selected date)

## Technical Details

This application is built with:
- Backend: Python and Flask
- Frontend: HTML, CSS, and JavaScript
- Data: Google Scholar API via the scholarly Python library

The time-based filtering works by:
1. Fetching the complete profile data from Google Scholar
2. Filtering out publications published after the selected date
3. For remaining publications, filtering out citations that were published after the selected date
4. Recalculating metrics based on the filtered data

## Limitations

- The application relies on the scholarly library, which can sometimes be blocked by Google Scholar
- The Google Scholar API has rate limits, so frequent searches may be temporarily blocked
- Publication years are used for filtering, so the granularity is limited to years rather than exact dates

## Disclaimer

This application is not affiliated with Google Scholar or Google. It is provided for educational and research purposes only.

## License

This project is licensed under the MIT License.
