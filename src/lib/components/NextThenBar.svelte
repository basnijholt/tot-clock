<script lang="ts">
  import type { Activity } from '../types';

  interface Props {
    next: (Activity & { duration: number }) | null;
  }

  let { next }: Props = $props();
</script>

<div class="next-bar">
  {#if next}
    <div class="next-content">
      <span class="next-label">NEXT:</span>
      <span class="next-emoji">{next.icon}</span>
      <span class="next-activity">{next.name}</span>
      <span class="next-moon">🌙</span>
    </div>
  {:else}
    <div class="next-content">
      <span class="all-done">ALL DONE! 🎉</span>
    </div>
  {/if}
</div>

<style>
  .next-bar {
    background: linear-gradient(180deg, #2a4a6a 0%, #1a3050 100%);
    padding: 16px 20px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  }

  .next-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: white;
    flex-wrap: wrap;
  }

  .next-label {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  .next-emoji {
    font-size: 36px;
  }

  .next-activity {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .next-moon {
    font-size: 28px;
  }

  .all-done {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-height: 600px) {
    .next-bar {
      padding: 12px 16px;
    }

    .next-emoji,
    .next-activity {
      font-size: 24px;
    }
  }
</style>
