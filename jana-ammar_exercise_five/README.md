# Exercise 5 - Patterns and MongoDB
---
## Overview
- This exercise explores emotional and contextual patterns in a dataset using MongoDB queries and custom visualizations. Each query isolates a specific condition in the data, and each visualization is designed to make that condition legible through grouping, spatial distribution, and interaction.
- The application is built with Flask and MongoDB Atlas and uses the provided insert script to generate the dataset.
---
## Dataset Structure
Each entry in the `dataStuff` MongoDB collection contains:
- `dataId` — unique identifier  
- `day` — day of the week  
- `weather` — weather condition  
- `start_mood` — mood before the event  
- `after_mood` — mood after the event  
- `after_mood_strength` — intensity of after mood (1–9)  
- `event_affect_strength` — intensity of event impact (1–9)  
- `event_name` — description of the event  
---
## Queries and Visualizations
### Query THREE — Positive After Mood
**Query Description**  
- This query returns all entries where the `after_mood` is classified as positive.

**Visualization Intention**  
The visualization maps emotional outcomes after events:
- Horizontal axis represents `after_mood_strength`
- Vertical axis represents `event_affect_strength`
Each dot corresponds to a single entry. The visualization reveals how strongly positive emotional outcomes correlate with event intensity and highlights clustering between impact and emotional resolution.
---
### Query FOUR — Entries Grouped by Event
**Query Description**  
This query returns all entries sorted by `event_name`.

**Visualization Intention**  
Each event is displayed as its own card, and each dot represents a single occurrence of that event.
This view emphasizes:
- frequency of specific events
- variation within repeated events
- comparative density across different event types
---
### Query FIVE — Monday vs Tuesday
**Query Description**  
This query filters entries that occurred on Monday or Tuesday and sorts them by `event_affect_strength`.

**Visualization Intention**  
- Each row represents a day, and dots are distributed horizontally by event impact strength.
- The visualization compares how event intensity differs between the two days, focusing on distribution rather than averages.
---
### Query SIX — Negative Start and Negative After Mood
**Query Description**  
This query returns entries where both `start_mood` and `after_mood` are negative, sorted by weather.

**Visualization Intention**  
- Each horizontal band represents a weather condition. Dots represent entries where negative mood persisted before and after the event.
- This visualization explores the relationship between environmental context and sustained negative emotional states, allowing patterns and outliers to emerge.
---
## Environment Variables
The project relies on a `.env` file containing:
```env
MONGODB_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=cart351
