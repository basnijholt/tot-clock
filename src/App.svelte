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
      // Only trigger transition if not already showing one
      if (timesUp && !showTransition) {
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
  <!-- Animated gradient background -->
  <div class="animated-gradient"></div>

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

</main>

<!-- Parent panel - outside main to avoid containing block issues with position:fixed -->
<ParentPanel visible={showParentPanel} onClose={() => (showParentPanel = false)} />

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    height: 100%;
    overflow: hidden;
    font-family: 'Patrick Hand', cursive, -apple-system, BlinkMacSystemFont, sans-serif;
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

  .animated-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 40% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 40%);
    background-size: 200% 200%, 200% 200%, 150% 150%;
    animation: gradient-shift 20s ease-in-out infinite;
  }

  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 0%, 100% 100%, 50% 50%;
    }
    25% {
      background-position: 50% 0%, 50% 100%, 0% 50%;
    }
    50% {
      background-position: 100% 50%, 0% 50%, 100% 0%;
    }
    75% {
      background-position: 50% 100%, 50% 0%, 50% 100%;
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
