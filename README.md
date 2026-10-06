# Sober Streaks

A shared sober-day calendar and streak leaderboard for six people:

- Jesk
- Data
- Voss
- Tone
- Cletey
- Buster

## What changed in v2

The old "add X days" counter has been replaced with a date-based tracker.

Each person can:
- Select their name
- View a monthly calendar
- Click individual days to mark them sober
- Click a marked day again to undo it
- See current and longest streaks
- See the shared leaderboard at the same time

The leaderboard is calculated from the actual sober dates stored in Netlify Database.

## Deploy

This repository is designed for Netlify.

- Publish directory: `public`
- Functions directory: `netlify/functions`
- Build command: leave blank

Netlify Database must be provisioned for the project. The migration in
`netlify/database/migrations/002_sober_days.sql` creates the date table.

## Important

There is intentionally no login system in this simple version. Anyone who has
the public URL can select any of the six names and change their marked days.
That matches the lightweight shared-group design.
