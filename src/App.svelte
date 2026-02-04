<script lang="ts">
  import { onMount } from 'svelte';
  import Clock from './lib/components/Clock.svelte';
  import ActivityDisplay from './lib/components/ActivityDisplay.svelte';
  import NextThenBar from './lib/components/NextThenBar.svelte';
  import Transition from './lib/components/Transition.svelte';
  import ParentPanel from './lib/components/ParentPanel.svelte';
  import {
    timerState,
    currentActivity,
    nextActivity,
    thenActivity,
    progress,
    tick,
    advanceToNext
  } from './lib/stores/timer';

  let showTransition = $state(false);
  let showParentPanel = $state(false);
  let tapped = $state(false);

  // Parent trigger long press
  let parentTriggerTimeout: ReturnType<typeof setTimeout> | null = null;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function startParentTrigger(e: Event) {
    e.preventDefault();
    parentTriggerTimeout = setTimeout(() => {
      showParentPanel = true;
      if (navigator.vibrate) navigator.vibrate(50);
    }, 2000);
  }

  function cancelParentTrigger() {
    if (parentTriggerTimeout) {
      clearTimeout(parentTriggerTimeout);
      parentTriggerTimeout = null;
    }
  }

  function handleTap() {
    if (showParentPanel) return;
    tapped = true;
    setTimeout(() => (tapped = false), 400);
  }

  // Fullscreen on double-tap
  let lastTap = 0;
  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap < 300) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    lastTap = now;
  }

  onMount(() => {
    // Timer loop
    const interval = setInterval(() => {
      const timesUp = tick();
      if (timesUp) {
        showTransition = true;
        setTimeout(() => {
          showTransition = false;
          advanceToNext();
        }, 2500);
      }
    }, 1000);

    // Request wake lock
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(() => {});
    }

    // Prevent context menu
    const preventContext = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext);

    // Handle visibility change
    const handleVisibility = () => {
      if (!document.hidden && !$timerState.isPaused && $timerState.lastTick) {
        const elapsed = Math.floor((Date.now() - $timerState.lastTick) / 1000);
        timerState.update((s) => ({
          ...s,
          remainingSeconds: Math.max(0, s.remainingSeconds - elapsed)
        }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  });
</script>

<main
  class="app"
  class:paused={$timerState.isPaused}
  class:tapped
  style="background: {$currentActivity?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}"
  onclick={handleTap}
  ontouchend={handleDoubleTap}
  role="application"
>
  <!-- Floating shapes -->
  <div class="floating-shapes">
    <div class="floating-shape"></div>
    <div class="floating-shape"></div>
    <div class="floating-shape"></div>
  </div>

  <!-- Transition overlay -->
  <Transition visible={showTransition} />

  <!-- Clock -->
  <div class="clock-section">
    <Clock
      progress={$progress}
      timeDisplay={formatTime($timerState.remainingSeconds)}
      color={$currentActivity?.colorLight || '#fff'}
    />
  </div>

  <!-- Activity display -->
  {#if $currentActivity}
    <ActivityDisplay icon={$currentActivity.icon} name={$currentActivity.name} />
  {:else}
    <ActivityDisplay icon="🎉" name="ALL DONE!" />
  {/if}

  <!-- Next/Then bar -->
  <NextThenBar next={$nextActivity} then={$thenActivity} />

  <!-- Parent trigger zone -->
  <div
    class="parent-trigger"
    role="button"
    tabindex="-1"
    onmousedown={startParentTrigger}
    onmouseup={cancelParentTrigger}
    onmouseleave={cancelParentTrigger}
    ontouchstart={startParentTrigger}
    ontouchend={cancelParentTrigger}
    ontouchcancel={cancelParentTrigger}
  ></div>

  <!-- Parent panel -->
  <ParentPanel visible={showParentPanel} onClose={() => (showParentPanel = false)} />
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    height: 100%;
    overflow: hidden;
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.2) 0%, transparent 50%);
    pointer-events: none;
    z-index: 1;
  }

  .app > :global(*) {
    position: relative;
    z-index: 2;
  }

  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }

  .floating-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s infinite ease-in-out;
  }

  .floating-shape:nth-child(1) {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -100px;
    animation-delay: 0s;
  }

  .floating-shape:nth-child(2) {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -50px;
    animation-delay: -5s;
  }

  .floating-shape:nth-child(3) {
    width: 150px;
    height: 150px;
    top: 50%;
    right: -75px;
    animation-delay: -10s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(-20px, 20px) rotate(5deg);
    }
    50% {
      transform: translate(0, 40px) rotate(0deg);
    }
    75% {
      transform: translate(20px, 20px) rotate(-5deg);
    }
  }

  .clock-section {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    padding-top: 25px;
  }

  .parent-trigger {
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    z-index: 50;
  }

  /* Paused state */
  .app.paused :global(.time-display) {
    animation: blink 1.2s ease-in-out infinite;
  }

  .app.paused :global(.activity-icon) {
    animation: none;
    opacity: 0.8;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }

  /* Tap feedback */
  .app.tapped :global(.activity-icon) {
    animation: tap-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
  }

  @keyframes tap-bounce {
    0%,
    100% {
      transform: scale(1) translateY(0);
    }
    50% {
      transform: scale(1.2) translateY(-20px);
    }
  }

  /* Landscape */
  @media (orientation: landscape) {
    .app {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .clock-section {
      flex: 0 0 40%;
      padding: 20px;
    }
  }

  @media (max-height: 600px) {
    .clock-section {
      padding: 15px;
      padding-top: 25px;
    }
  }
</style>
