# Tot Clock 🧸⏰

A beautiful, toddler-friendly visual routine timer. Features a large countdown clock with colored wedge, iCal calendar sync, schedule editor, and a kid-proof interface.

Perfect for wall-mounted tablets to help toddlers understand daily routines.

## Features

- **Beautiful UI** - Gradient backgrounds, floating animations, confetti celebrations
- **Large analog clock** with colored countdown wedge
- **Kid-proof** - Taps only trigger harmless animations
- **Parent controls** - Hidden behind 2-second long-press
- **Schedule editor** - Add, remove, reorder activities with duration
- **iCal sync** - Fetch today's schedule from any iCal URL
- **State persistence** - Resumes after refresh
- **Wake lock** - Prevents screen sleep

## Quick Start

```bash
bun install
bun dev
```

Open http://localhost:5173

## Build for Production

```bash
bun run build
bun run preview
```

## iCal Integration

1. Long-press top-left corner (2 seconds) to open parent panel
2. Paste your iCal URL (Google Calendar, Apple Calendar, etc.)
3. Click "Sync Calendar"

The app matches calendar event titles to activities:
- Event "Dinner" → DINNER activity
- Event "Bath time" → BATH activity
- Event "Play" → PLAY activity

## Activities

Pre-configured activities (edit `src/lib/activities.ts`):

| Activity | Icon | Keywords matched |
|----------|------|------------------|
| play | 🧸 | play, playtime, toys |
| dinner | 🍽️ | dinner, supper |
| bath | 🛁 | bath, wash, shower |
| story | 📚 | story, book, reading |
| sleep | 🌙 | sleep, bed, bedtime |
| breakfast | 🥣 | breakfast |
| outside | 🌳 | outside, park, garden |
| tv | 📺 | tv, movie, cartoon |
| teeth | 🦷 | teeth, brush, dental |
| ...and more |

## Parent Controls

**Access:** Long-press top-left corner for 2 seconds

- Play/Pause timer
- Skip to next activity
- Add +1 or +5 minutes
- Load preset routine
- Edit schedule (add/remove/reorder activities)
- Sync with iCal calendar
- Restart schedule

## Kiosk Mode

### Android (Fully Kiosk Browser)
1. Install Fully Kiosk Browser
2. Set URL to your hosted app
3. Enable fullscreen, disable screen timeout

### iPad
1. Add to Home Screen from Safari
2. Enable Guided Access in Settings → Accessibility

### Chrome
```bash
google-chrome --kiosk --app=http://localhost:5173
```

## Tech Stack

- **Svelte 5** with runes
- **TypeScript**
- **Vite**
- **ical.js** for calendar parsing
- **Bun** as runtime/package manager

## File Structure

```
src/
├── App.svelte              # Main app component
├── main.ts                 # Entry point
└── lib/
    ├── types.ts            # TypeScript types
    ├── activities.ts       # Activity definitions
    ├── stores/
    │   └── timer.ts        # State management
    ├── components/
    │   ├── Clock.svelte
    │   ├── ActivityDisplay.svelte
    │   ├── NextThenBar.svelte
    │   ├── Transition.svelte
    │   └── ParentPanel.svelte
    └── utils/
        └── ical.ts         # iCal parsing
```

## License

MIT
