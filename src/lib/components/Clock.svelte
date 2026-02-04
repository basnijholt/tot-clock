<script lang="ts">
  interface Props {
    progress: number;
    timeDisplay: string;
    minutesLeft: number;
  }

  let { progress, timeDisplay, minutesLeft }: Props = $props();

  const CLOCK_CENTER = 110;
  const CLOCK_RADIUS = 90;

  // Use dark text when wedge is small (less than 30% coverage in center area)
  let useDarkText = $derived(progress < 0.3);

  function calculateWedgePath(prog: number): string {
    if (prog <= 0) return '';
    if (prog >= 1) {
      // Full circle
      return `M ${CLOCK_CENTER} ${CLOCK_CENTER} L ${CLOCK_CENTER} ${CLOCK_CENTER - CLOCK_RADIUS} A ${CLOCK_RADIUS} ${CLOCK_RADIUS} 0 1 1 ${CLOCK_CENTER - 0.01} ${CLOCK_CENTER - CLOCK_RADIUS} Z`;
    }

    // Wedge starts at 12 o'clock and goes clockwise
    const angle = prog * 360;
    const radians = (angle - 90) * (Math.PI / 180);
    const x = CLOCK_CENTER + CLOCK_RADIUS * Math.cos(radians);
    const y = CLOCK_CENTER + CLOCK_RADIUS * Math.sin(radians);
    const largeArc = angle > 180 ? 1 : 0;

    return `M ${CLOCK_CENTER} ${CLOCK_CENTER} L ${CLOCK_CENTER} ${CLOCK_CENTER - CLOCK_RADIUS} A ${CLOCK_RADIUS} ${CLOCK_RADIUS} 0 ${largeArc} 1 ${x} ${y} Z`;
  }
</script>

<div class="clock-container">
  <svg class="clock" viewBox="0 0 220 220">
    <defs>
      <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3" />
      </filter>
      <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.5" />
      </filter>
    </defs>

    <!-- Outer ring / border -->
    <circle cx="110" cy="110" r="105" fill="#5a8cc8" />

    <!-- White clock face -->
    <circle cx="110" cy="110" r="98" fill="#ffffff" filter="url(#clockShadow)" />

    <!-- Tick marks -->
    <g class="tick-marks">
      {#each Array(12) as _, i}
        {@const angle = (i * 30 - 90) * (Math.PI / 180)}
        {@const innerR = i % 3 === 0 ? 82 : 86}
        {@const outerR = 92}
        {@const x1 = CLOCK_CENTER + innerR * Math.cos(angle)}
        {@const y1 = CLOCK_CENTER + innerR * Math.sin(angle)}
        {@const x2 = CLOCK_CENTER + outerR * Math.cos(angle)}
        {@const y2 = CLOCK_CENTER + outerR * Math.sin(angle)}
        <line
          {x1}
          {y1}
          {x2}
          {y2}
          class="tick"
          class:major={i % 3 === 0}
        />
      {/each}
    </g>

    <!-- 12 marker -->
    <text x="110" y="38" class="clock-12">12</text>

    <!-- Countdown wedge (dark blue, filled sector) -->
    <path
      d={calculateWedgePath(progress)}
      class="countdown-wedge"
    />

    <!-- Time display (on top of wedge) -->
    <text
      x="110"
      y="105"
      class="time-display"
      class:dark={useDarkText}
      filter={useDarkText ? '' : 'url(#textShadow)'}
    >{timeDisplay}</text>
    <text
      x="110"
      y="130"
      class="time-subtext"
      class:dark={useDarkText}
    >{minutesLeft} min left</text>
  </svg>
</div>

<style>
  .clock-container {
    width: min(70vw, 50vh);
    max-width: 380px;
    position: relative;
  }

  .clock {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25));
  }

  .tick {
    stroke: #c0d4e8;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .tick.major {
    stroke: #7ba3cc;
    stroke-width: 3;
  }

  .clock-12 {
    font-size: 16px;
    font-weight: 700;
    fill: #5a7a9a;
    text-anchor: middle;
  }

  .countdown-wedge {
    fill: #3d5a7a;
    opacity: 0.9;
    transition: d 0.3s ease-out;
  }

  .time-display {
    font-size: 42px;
    font-weight: 800;
    fill: #ffffff;
    text-anchor: middle;
    dominant-baseline: middle;
    letter-spacing: 2px;
    transition: fill 0.3s ease;
  }

  .time-display.dark {
    fill: #3d5a7a;
  }

  .time-subtext {
    font-size: 16px;
    font-weight: 600;
    fill: #ffffff;
    text-anchor: middle;
    opacity: 0.95;
    transition: fill 0.3s ease, opacity 0.3s ease;
  }

  .time-subtext.dark {
    fill: #5a7a9a;
    opacity: 0.8;
  }
</style>
