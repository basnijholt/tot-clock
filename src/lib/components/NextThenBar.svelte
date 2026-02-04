<script lang="ts">
  import type { Activity } from '../types';

  interface Props {
    next: (Activity & { duration: number }) | null;
    then: (Activity & { duration: number }) | null;
  }

  let { next, then }: Props = $props();
</script>

<div class="next-then-bar">
  <div
    class="block next-block"
    class:empty={!next}
    style="background: {next?.gradient || 'rgba(0,0,0,0.3)'}"
  >
    {#if next}
      <div class="block-content">
        <span class="block-label">NEXT</span>
        <span class="block-icon">{next.icon}</span>
        <span class="block-name">{next.name}</span>
      </div>
    {/if}
  </div>
  <div
    class="block then-block"
    class:empty={!then}
    style="background: {then?.gradient || 'rgba(0,0,0,0.3)'}"
  >
    {#if then}
      <div class="block-content">
        <span class="block-label">THEN</span>
        <span class="block-icon">{then.icon}</span>
        <span class="block-name">{then.name}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .next-then-bar {
    display: flex;
    height: 110px;
    gap: 8px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
  }

  .block {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    border-radius: 20px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  .block::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
    pointer-events: none;
  }

  .block-content {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .block-label {
    font-size: min(3.5vw, 16px);
    font-weight: 700;
    opacity: 0.9;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .block-icon {
    font-size: min(10vw, 44px);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .block-name {
    font-size: min(7vw, 32px);
    font-weight: 800;
    letter-spacing: 2px;
  }

  .block.empty {
    opacity: 0.3;
  }

  @media (max-height: 600px) {
    .next-then-bar {
      height: 85px;
    }
  }

  @media (orientation: landscape) {
    .next-then-bar {
      flex: 0 0 100%;
      height: 90px;
    }
  }
</style>
