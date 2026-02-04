<script lang="ts">
  interface Props {
    visible: boolean;
  }

  let { visible }: Props = $props();
</script>

{#if visible}
  <div class="transition-overlay">
    <div class="confetti-container">
      {#each Array(12) as _, i}
        <div class="confetti" style="--delay: {i * 0.1}s; --left: {5 + i * 8}%"></div>
      {/each}
    </div>
    <div class="transition-content">
      <div class="checkmark">✓</div>
      <div class="transition-text">ALL DONE!</div>
    </div>
  </div>
{/if}

<style>
  .transition-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.3s ease;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .confetti {
    position: absolute;
    width: 15px;
    height: 15px;
    top: -20px;
    left: var(--left);
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .confetti:nth-child(odd) {
    background: #ff6b6b;
    border-radius: 50%;
  }

  .confetti:nth-child(even) {
    background: #4ecdc4;
  }

  .confetti:nth-child(3n) {
    background: #ffe66d;
    border-radius: 2px;
  }

  .confetti:nth-child(4n) {
    background: #95e1d3;
    border-radius: 50%;
  }

  .confetti:nth-child(5n) {
    background: #f38181;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .transition-content {
    text-align: center;
    animation: celebration-entrance 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes celebration-entrance {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  .checkmark {
    width: 150px;
    height: 150px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    margin: 0 auto 30px;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 0 10px rgba(255, 255, 255, 0.2);
    animation: pulse-glow 1s ease-in-out infinite;
    color: #22c55e;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 0 0 10px rgba(255, 255, 255, 0.2);
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        0 25px 80px rgba(0, 0, 0, 0.4),
        0 0 0 20px rgba(255, 255, 255, 0.3);
    }
  }

  .transition-text {
    font-size: 56px;
    font-weight: 800;
    color: white;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    letter-spacing: 4px;
  }
</style>
