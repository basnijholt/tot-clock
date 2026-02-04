<script lang="ts">
  interface Props {
    icon: string;
    name: string;
  }

  let { icon, name }: Props = $props();
</script>

<div class="activity-section">
  <div class="activity-icon-wrapper">
    <div class="activity-icon-bg"></div>
    <div class="activity-icon">{icon}</div>
  </div>
  <div class="activity-name">{name}</div>
</div>

<style>
  .activity-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    min-height: 0;
  }

  .activity-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .activity-icon-bg {
    position: absolute;
    width: 260px;
    height: 260px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    animation: icon-bg-pulse 4s ease-in-out infinite;
  }

  @keyframes icon-bg-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.2;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.3;
    }
  }

  .activity-icon {
    font-size: min(40vw, 200px);
    line-height: 1;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
    animation: gentle-float 3s ease-in-out infinite;
  }

  @keyframes gentle-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .activity-name {
    font-size: min(18vw, 90px);
    font-weight: 800;
    color: white;
    text-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    letter-spacing: 6px;
    text-transform: uppercase;
  }

  @media (max-height: 600px) {
    .activity-icon {
      font-size: min(25vw, 110px);
    }
    .activity-name {
      font-size: min(14vw, 60px);
    }
    .activity-icon-bg {
      width: 140px;
      height: 140px;
    }
  }
</style>
