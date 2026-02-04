<script lang="ts">
  interface Props {
    progress: number;
    timeDisplay: string;
    color: string;
  }

  let { progress, timeDisplay, color }: Props = $props();

  const CLOCK_CENTER = 110;
  const CLOCK_RADIUS = 88;

  function calculateWedgePath(prog: number): string {
    if (prog <= 0) return '';
    if (prog >= 1) {
      return `M ${CLOCK_CENTER} ${CLOCK_CENTER} L ${CLOCK_CENTER} ${CLOCK_CENTER - CLOCK_RADIUS} A ${CLOCK_RADIUS} ${CLOCK_RADIUS} 0 1 1 ${CLOCK_CENTER - 0.01} ${CLOCK_CENTER - CLOCK_RADIUS} Z`;
    }

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
      <linearGradient id="clockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
      </linearGradient>

      <linearGradient id="centerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
      </linearGradient>

      <radialGradient id="innerShadow" cx="50%" cy="0%" r="100%">
        <stop offset="0%" style="stop-color:#000000;stop-opacity:0.03" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
      </radialGradient>

      <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- Outer ring -->
    <circle cx="110" cy="110" r="105" fill="#ffffff" filter="url(#clockShadow)" />
    <circle cx="110" cy="110" r="105" class="clock-rim" />

    <!-- Clock face -->
    <circle cx="110" cy="110" r="100" fill="url(#clockGradient)" />
    <circle cx="110" cy="110" r="100" fill="url(#innerShadow)" />

    <!-- Progress ring background -->
    <circle cx="110" cy="110" r="92" class="progress-ring-bg" />

    <!-- Tick marks -->
    <g class="tick-marks">
      <line x1="110" y1="18" x2="110" y2="30" class="tick major" />
      <line x1="156" y1="26" x2="151" y2="36" class="tick" />
      <line x1="192" y1="64" x2="182" y2="70" class="tick" />
      <line x1="202" y1="110" x2="190" y2="110" class="tick major" />
      <line x1="192" y1="156" x2="182" y2="150" class="tick" />
      <line x1="156" y1="194" x2="151" y2="184" class="tick" />
      <line x1="110" y1="202" x2="110" y2="190" class="tick major" />
      <line x1="64" y1="194" x2="69" y2="184" class="tick" />
      <line x1="28" y1="156" x2="38" y2="150" class="tick" />
      <line x1="18" y1="110" x2="30" y2="110" class="tick major" />
      <line x1="28" y1="64" x2="38" y2="70" class="tick" />
      <line x1="64" y1="26" x2="69" y2="36" class="tick" />
    </g>

    <!-- Countdown wedge -->
    <path
      d={calculateWedgePath(progress)}
      class="countdown-wedge"
      style="color: {color}"
    />

    <!-- Center circle -->
    <circle cx="110" cy="110" r="55" fill="url(#centerGradient)" class="clock-center" />
    <circle cx="110" cy="110" r="55" class="clock-center-ring" />

    <!-- Time display -->
    <text x="110" y="118" class="time-display">{timeDisplay}</text>
  </svg>
</div>

<style>
  .clock-container {
    width: min(70vw, 40vh);
    max-width: 400px;
    position: relative;
  }

  .clock-container::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 110%;
    height: 110%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
    pointer-events: none;
  }

  .clock {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.3));
    position: relative;
  }

  .clock-rim {
    fill: none;
    stroke: rgba(255, 255, 255, 0.8);
    stroke-width: 4;
  }

  .progress-ring-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 6;
  }

  .tick {
    stroke: #cbd5e1;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .tick.major {
    stroke: #64748b;
    stroke-width: 3;
  }

  .countdown-wedge {
    fill: currentColor;
    opacity: 0.85;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    transition: d 0.1s linear;
  }

  .clock-center {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }

  .clock-center-ring {
    fill: none;
    stroke: rgba(255, 255, 255, 0.5);
    stroke-width: 2;
  }

  .time-display {
    font-size: 32px;
    font-weight: 800;
    fill: #1e293b;
    text-anchor: middle;
    dominant-baseline: middle;
    letter-spacing: 1px;
  }
</style>
