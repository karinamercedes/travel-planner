# Travel Planner

A free, no-signup web app for planning a multi-day trip. Add the places you want to visit, how long each one takes and when in the day suits it, and the app groups them into realistic days by how close they are to each other. Warns you if you've planned too much for the time you have, and exports the result as a calendar file, CSV/Excel sheet, or PDF.

**Live demo:** _add your Vercel link here once deployed_
**Repo:** _add your GitHub link here_

## Why this exists

I'm a front-end WordPress developer moving into React, and I wanted a project with real logic behind it rather than another to-do list. This one has an actual scheduling problem to solve: given a set of places, their durations and time preferences, and a number of days, build a plan that fits — and tell the user clearly when it doesn't.

## Features

- Add a trip (city, number of days, start date, pace)
- Search for real places (OpenStreetMap) and see them on a map
- Set a duration, preferred time of day (morning/afternoon/evening/any), and priority (must-see / nice to have) per place
- A live feasibility check warns when the plan doesn't fit the days available, and suggests fixes (add a day, change pace, drop nice-to-have places)
- One-click automatic planning: groups places into days by proximity, orders each day by nearest-neighbour, assigns times
- Manually move a place to another day; anything that doesn't fit goes to a visible "Unscheduled" list, never silently dropped
- Reset button to start a new trip from scratch
- Export to calendar (.ics), CSV (Excel/Sheets), or PDF (print)
- Everything is saved in the browser (no account needed), with a JSON backup/restore option

## Tech stack

React + Vite, react-leaflet/Leaflet for the map, OpenStreetMap's Nominatim for place search, no backend, no paid services. See the "Free services" and "How the planner works" sections below for details and limitations.

## Run it locally

```bash
npm install
npm run dev
```
Open the address it prints (usually http://localhost:5173).

## Project structure

```
src/
  components/   TripForm, PlaceForm, PlaceSearch, PlaceList, MapView,
                FeasibilityBanner, PlanControls, DayView, ExportMenu, BackupControls
  hooks/        useLocalStorage.js
  utils/        format.js, geo.js, geocode.js, feasibility.js, planner.js, exporters.js
  App.jsx
```

## How the feasibility check works

A day has 660 usable minutes (morning 09:00-13:00, afternoon 14:00-18:00, evening 19:00-22:00). The pace setting (relaxed 70%, normal 85%, packed 100%) decides how much of that is used. Each place costs its duration plus a 15-minute walking buffer. If the total exceeds capacity for the chosen days, or too many places want the same part of the day, a banner explains why and offers fixes. Must-see places are never suggested for removal.

## How the planner works

1. **Which day?** Every day gets a centre in a different part of the city (starting points chosen as far apart as possible). Each place joins the day with the nearest centre; centres then move to the middle of their group. Repeated 4 times (a simple k-means clustering). Overfull days move their least important place (nice-to-have first, then farthest from centre) to the nearest day with room, or to Unscheduled.
2. **Order and times.** Time-of-day preferences are respected; "any time" places fill the remaining room. Within a slot, the route always walks to the nearest unvisited place. Times are assigned with a 15-minute walking buffer between stops.
3. **Moving places.** Picking a day in the dropdown pins a place there; the planner keeps it on that day from then on.

**Known limitations:** distances are straight-line, not real walking routes. Opening hours aren't checked. The clustering is a simple heuristic, not a route optimiser.

## Free services used

- **Place search:** OpenStreetMap Nominatim, with a short debounce while typing to stay within the free tier's rate limit.
- **Map:** Leaflet with OpenStreetMap tiles (attribution shown on the map, as required).
- No paid APIs, no account, no backend.

## Roadmap

- [x] Trip form, add/delete places, saved in browser
- [x] Place search (Nominatim) and map (Leaflet)
- [x] Feasibility warning
- [x] Automatic day planning
- [x] Exports (calendar, CSV, PDF) and JSON backup
- [ ] Suggest which places to drop, or turn a pasted list into places
- [ ] Real opening-hours data
- [ ] Walking-time estimates instead of straight-line distance
