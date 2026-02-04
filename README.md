# Tot Clock 🧸⏰

[![License](https://img.shields.io/github/license/basnijholt/tot-clock?style=for-the-badge)](LICENSE)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-runtime-FBF0DF?style=for-the-badge&logo=bun)](https://bun.sh/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

A beautiful, toddler-friendly visual routine timer. Features a large countdown clock with colored wedge, iCal calendar sync, schedule editor, and a kid-proof interface.

Perfect for wall-mounted tablets to help toddlers understand daily routines.

<p align="center">
  <img src="tests/screenshots/main-view.png" alt="Tot Clock Main View" width="300"/>
  <img src="tests/screenshots/parent-panel.png" alt="Parent Controls Panel" width="300"/>
</p>

## :books: Table of Contents

- [:sparkles: Features](#sparkles-features)
- [:rocket: Quick Start](#rocket-quick-start)
- [:whale: Docker](#whale-docker)
- [:calendar: iCal Integration](#calendar-ical-integration)
- [:art: Activities](#art-activities)
- [:lock: Parent Controls](#lock-parent-controls)
- [:tv: Kiosk Mode](#tv-kiosk-mode)
- [:test_tube: Testing](#test_tube-testing)
- [:wrench: Tech Stack](#wrench-tech-stack)
- [:file_folder: File Structure](#file_folder-file-structure)

## :sparkles: Features

- **Beautiful UI** - Blue gradient background with subtle glows and shadows
- **Large analog clock** with dark wedge showing time remaining (Time Timer style)
- **Kid-proof** - Taps only trigger harmless bounce animations
- **Parent controls** - Hidden behind 2-second long-press in corner
- **Schedule editor** - Add, remove, reorder activities with duration
- **iCal sync** - Fetch today's schedule from any iCal URL (Google Calendar, Apple Calendar, etc.)
- **State persistence** - Resumes exactly where you left off after refresh
- **Wake lock** - Prevents screen from sleeping

<p align="center">
  <img src="tests/screenshots/activity-dinner.png" alt="Dinner Activity" width="280"/>
  <img src="tests/screenshots/landscape.png" alt="Landscape Mode" width="400"/>
</p>

## :rocket: Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Open http://localhost:5173

### Build for Production

```bash
bun run build
bun run preview
```

## :whale: Docker

```bash
# Build the image
docker build -t tot-clock .

# Run on port 8080
docker run -p 8080:80 tot-clock
```

Open http://localhost:8080

The Docker image uses a multi-stage build with Bun for building and nginx for serving, with optimized caching headers for static assets.

## :calendar: iCal Integration

1. Long-press top-left corner (2 seconds) to open parent panel
2. Paste your iCal URL (Google Calendar, Apple Calendar, etc.)
3. Click "Sync Calendar"

The app matches calendar event titles to activities:

| Event Title | Matched Activity |
|-------------|------------------|
| "Dinner" | 🍽️ DINNER |
| "Bath time" | 🛁 BATH |
| "Play" | 🧸 PLAY |
| "Story time" | 📚 STORY |

## :art: Activities

Pre-configured activities (edit `src/lib/activities.ts`):

| Activity | Icon | Color | Keywords matched |
|----------|------|-------|------------------|
| play | 🧸 | Green | play, playtime, toys |
| dinner | 🍽️ | Orange | dinner, supper |
| bath | 🛁 | Blue | bath, wash, shower |
| story | 📚 | Purple | story, book, reading |
| sleep | 🌙 | Indigo | sleep, bed, bedtime |
| breakfast | 🥣 | Yellow | breakfast |
| outside | 🌳 | Emerald | outside, park, garden |
| tv | 📺 | Slate | tv, movie, cartoon |
| teeth | 🦷 | Cyan | teeth, brush, dental |
| ...and more! |

## :lock: Parent Controls

**Access:** Long-press top-left corner for 2 seconds

- ▶️ Play/Pause timer
- ⏭️ Skip to next activity
- ➕ Add +1 or +5 minutes
- 📋 Load preset routine (Normal Day, Weekend, Quick)
- ✏️ Edit schedule (add/remove/reorder activities)
- 🔄 Sync with iCal calendar
- 🔁 Restart schedule

## :tv: Kiosk Mode

### Android (Fully Kiosk Browser)

1. Install [Fully Kiosk Browser](https://www.fully-kiosk.com/)
2. Set URL to your hosted app
3. Enable fullscreen, disable screen timeout

### iPad

1. Add to Home Screen from Safari
2. Enable Guided Access in Settings → Accessibility

### Chrome

```bash
google-chrome --kiosk --app=http://localhost:5173
```

## :test_tube: Testing

The project uses [Playwright](https://playwright.dev/) for end-to-end testing.

```bash
# Run tests
bun run test

# Run tests with UI
bun run test:ui
```

### Test Coverage

- Initial activity display with clock
- Next activity bar
- Parent panel long-press access
- Play/pause functionality
- Add time controls
- Schedule editor
- Routine selector
- Responsive layouts (tablet portrait, landscape)
- Transition celebrations

<p align="center">
  <img src="tests/screenshots/transition.png" alt="Transition Celebration" width="300"/>
</p>

## :wrench: Tech Stack

| Technology | Purpose |
|------------|---------|
| [Svelte 5](https://svelte.dev/) | UI framework with runes |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool |
| [ical.js](https://github.com/kewisch/ical.js) | Calendar parsing |
| [Bun](https://bun.sh/) | Runtime & package manager |
| [Playwright](https://playwright.dev/) | E2E testing |
| [Docker](https://www.docker.com/) + nginx | Production deployment |

## :file_folder: File Structure

```
src/
├── App.svelte              # Main app component
├── main.ts                 # Entry point
└── lib/
    ├── types.ts            # TypeScript types
    ├── activities.ts       # Activity definitions (18 activities)
    ├── stores/
    │   └── timer.ts        # State management with localStorage
    ├── components/
    │   ├── Clock.svelte          # SVG clock with countdown wedge
    │   ├── ActivityDisplay.svelte # Large icon and name
    │   ├── NextThenBar.svelte    # Bottom bar with next activity
    │   ├── Transition.svelte     # Confetti celebration overlay
    │   └── ParentPanel.svelte    # Schedule editor and controls
    └── utils/
        └── ical.ts         # iCal fetching and parsing

tests/
├── app.spec.ts             # Playwright E2E tests
└── screenshots/            # Auto-captured test screenshots
```

## :page_facing_up: License

MIT
