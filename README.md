# Philadelphia Traffic Collision Visualization

![image](https://github.com/user-attachments/assets/cf7eb463-880a-4a2a-a5cd-13037da0cbd4)

This project is an interactive narrative visualization of traffic collision incidents in Philadelphia, written using the D3.js library. It aims to highlight the traffic violence in Philadelphia, with a particular emphasis on pedestrian and cyclist casualties, representing two of the most vulnerable mode of transportation in our transportation infrastructure.

These data were sourced from [PennDOT's Crash Database](https://pennshare.maps.arcgis.com/apps/webappviewer/index.html?id=8fdbf046e36e41649bbfd9d7dd7c7e7e), and this project was inspired by an [earlier analysis](https://aseyedia.github.io/philly-crash-stats/code/phillyCrashStats.html) I did using last year's crash data in R. The repo can be found [here](https://github.com/aseyedia/philly-crash-stats). 

These data were preprocessed ([1](https://github.com/aseyedia/philly-crash-stats/blob/main/code/download_preprocess.R) and [2](https://github.com/aseyedia/philly-crash-stats/blob/main/code/export.R)) for inclusion in this project. [The Philadelphia SVG was ordered from Etsy](https://www.etsy.com/listing/1234225021/philadelphia-svg-street-map-philadelphia?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=Philadelphia+SVG+Street+Map&ref=sr_gallery-1-1&dd=1&content_source=d27f2d577b89f446df5bf21a2200de53d8a8df5b%253A1234225021&organic_search_click=1).

<p align="center">
  <a href="https://aseyedia.github.io/cs416-narrative-viz/" style="font-size: 24px; font-weight: bold;">Visit the GitHub Page</a>
</p>

## Features

- Interactive map of Philadelphia showing traffic collision data
- Year-by-year analysis from 2002 to 2023
- Breakdown of total collisions, fatalities, bicycle fatalities, and pedestrian fatalities
- Time-of-day analysis with customizable filters for cyclists and pedestrians

## Technologies Used

- D3.js for data visualization
- HTML/CSS for structure and styling
- JavaScript for interactivity

## Data Source

The data used in this visualization is sourced from [insert your data source here, e.g., "Philadelphia's Open Data Portal"].

## How to Use

1. Select a year using the dropdown menu in the top right corner.
2. Click anywhere on the visualization to progress through the different views:
   - Overview of all collisions
   - Fatal collisions
   - Bicycle fatalities
   - Pedestrian fatalities
   - Time-of-day analysis
3. In the time-of-day analysis, use the slider to select different hours and the dropdown to filter by collision type.

## Local Development

To run this project locally:

1. Clone the repository
2. Navigate to the project directory
3. Start a local server (e.g., using Python: `python -m http.server 8000`)
4. Open a browser and go to `http://localhost:8000`


