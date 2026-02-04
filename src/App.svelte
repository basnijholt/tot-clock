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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getMinutesLeft(seconds: number): number {
    return Math.ceil(seconds / 60);
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
  style="--theme-color: {$currentActivity?.color || '#4a90d9'}"
  onclick={handleTap}
  ontouchend={handleDoubleTap}
  role="application"
>
  <!-- Background gradients -->
  <div class="background">
    <div class="bg-gradient"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <div class="bg-glow bg-glow-3"></div>
    <div class="bg-ground"></div>
  </div>

  <!-- Transition overlay -->
  <Transition visible={showTransition} />

  <!-- Main content -->
  <div class="content">
    <!-- Clock -->
    <div class="clock-section">
      <Clock
        progress={$progress}
        timeDisplay={formatTime($timerState.remainingSeconds)}
        minutesLeft={getMinutesLeft($timerState.remainingSeconds)}
      />
    </div>

    <!-- Activity display -->
    <div class="activity-section">
      {#if $currentActivity}
        <ActivityDisplay icon={$currentActivity.icon} name={$currentActivity.name} />
      {:else}
        <ActivityDisplay icon="🎉" name="ALL DONE!" />
      {/if}
    </div>
  </div>

  <!-- Next bar -->
  <div class="next-bar-wrapper">
    <NextThenBar next={$nextActivity} />
  </div>

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
  }

  /* Background layers */
  .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  .bg-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, #5a9bd4 0%, #4a8bc4 30%, #3a7bb4 70%, #2a6ba4 100%);
  }

  .bg-glow {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .bg-glow-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    left: -100px;
  }

  .bg-glow-2 {
    width: 300px;
    height: 300px;
    top: 20%;
    right: -80px;
  }

  .bg-glow-3 {
    width: 250px;
    height: 250px;
    bottom: 15%;
    left: 10%;
  }

  .bg-ground {
    position: absolute;
    bottom: 0;
    left: -10%;
    right: -10%;
    height: 35%;
    background: radial-gradient(ellipse 120% 100% at 50% 100%, rgba(30, 60, 100, 0.4) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Content */
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    z-index: 1;
    padding-top: 40px;
  }

  .clock-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .activity-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
  }

  .next-bar-wrapper {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
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
    .content {
      flex-direction: row;
      padding-top: 20px;
    }

    .clock-section {
      flex: 0 0 45%;
      margin-bottom: 0;
    }

    .activity-section {
      flex: 0 0 55%;
    }
  }

  @media (max-height: 600px) {
    .content {
      padding-top: 20px;
    }
  }
</style>
