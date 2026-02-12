<script lang="ts">
  import {
    timerState,
    settings,
    loadRoutine,
    togglePause,
    skip,
    addTime,
    restart,
    syncWithIcal,
    updateSettings,
    setSchedule,
    updateScheduleLive
  } from '../stores/timer';
  import { get } from 'svelte/store';
  import { activities, defaultRoutines, getActivity } from '../activities';
  import type { ScheduleItem } from '../types';

  interface Props {
    visible: boolean;
    onClose: () => void;
  }

  let { visible, onClose }: Props = $props();

  let icalUrl = $state($settings.icalUrl);
  let syncing = $state(false);
  let syncError = $state('');

  // Local schedule for editing
  let editSchedule = $state<ScheduleItem[]>([]);

  $effect(() => {
    if (visible) {
      editSchedule = [...get(timerState).schedule];
    }
  });

  async function handleSync() {
    syncing = true;
    syncError = '';
    updateSettings({ icalUrl });

    const success = await syncWithIcal();
    if (!success && icalUrl) {
      syncError = 'Failed to fetch or parse calendar. Check the URL.';
    }
    syncing = false;
  }

  function handleLoadRoutine(key: string) {
    loadRoutine(key);
    editSchedule = [...$timerState.schedule];
  }

  function pushSchedule(currentIndex?: number) {
    if (editSchedule.length > 0) {
      updateScheduleLive(editSchedule, currentIndex ?? get(timerState).currentIndex);
    }
  }

  function addActivity(activityId: string) {
    editSchedule = [...editSchedule, { activity: activityId, duration: 10, totalSeconds: 600 }];
    pushSchedule();
  }

  function removeActivity(index: number) {
    let currentIndex = get(timerState).currentIndex;
    editSchedule = editSchedule.filter((_, i) => i !== index);
    if (editSchedule.length === 0) return;
    if (index < currentIndex) {
      currentIndex--;
    } else if (currentIndex >= editSchedule.length) {
      currentIndex = editSchedule.length - 1;
    }
    pushSchedule(currentIndex);
  }

  function updateDuration(index: number, duration: number) {
    editSchedule = editSchedule.map((item, i) =>
      i === index ? { ...item, duration, totalSeconds: duration * 60 } : item
    );
    pushSchedule();
  }

  const activityList = Object.values(activities);

  // Drag-to-reorder state
  let draggingIndex = $state<number | null>(null);
  let dragStartY = 0;
  let dragItemHeight = 0;

  function handlePointerDown(index: number, e: PointerEvent) {
    draggingIndex = index;
    dragStartY = e.clientY;
    const item = (e.target as HTMLElement).closest('.schedule-item');
    if (item) {
      dragItemHeight = item.getBoundingClientRect().height + 8;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (draggingIndex === null) return;
    e.preventDefault();

    const deltaY = e.clientY - dragStartY;

    if (Math.abs(deltaY) > dragItemHeight / 2) {
      const direction: -1 | 1 = deltaY > 0 ? 1 : -1;
      const newIndex = draggingIndex + direction;
      if (newIndex >= 0 && newIndex < editSchedule.length) {
        // Track currentIndex through the swap
        let currentIndex = get(timerState).currentIndex;
        if (currentIndex === draggingIndex) {
          currentIndex = newIndex;
        } else if (currentIndex === newIndex) {
          currentIndex = draggingIndex;
        }

        const newSchedule = [...editSchedule];
        [newSchedule[draggingIndex], newSchedule[newIndex]] = [newSchedule[newIndex], newSchedule[draggingIndex]];
        editSchedule = newSchedule;
        draggingIndex = newIndex;
        dragStartY += direction * dragItemHeight;
        pushSchedule(currentIndex);
      }
    }
  }

  function handlePointerUp() {
    draggingIndex = null;
  }
</script>

{#if visible}
  <div class="parent-panel">
    <div class="parent-header">
      <h2>Parent Controls</h2>
      <button class="close-btn" onclick={onClose}>✕</button>
    </div>

    <div class="parent-content">
      <!-- Playback Controls -->
      <div class="control-group">
        <h3>Playback</h3>
        <div class="button-row">
          <button class="ctrl-btn" onclick={togglePause}>
            {$timerState.isPaused ? '▶️ Play' : '⏸️ Pause'}
          </button>
          <button class="ctrl-btn secondary" onclick={skip}>⏭️ Skip</button>
        </div>
        <div class="button-row">
          <button class="ctrl-btn secondary" onclick={() => addTime(1)}>+1 min</button>
          <button class="ctrl-btn secondary" onclick={() => addTime(5)}>+5 min</button>
        </div>
      </div>

      <!-- iCal Sync -->
      <div class="control-group">
        <h3>Calendar Sync (iCal)</h3>
        <input
          type="url"
          class="input"
          placeholder="https://calendar.google.com/...ical"
          bind:value={icalUrl}
        />
        <button class="ctrl-btn" onclick={handleSync} disabled={syncing}>
          {syncing ? '⏳ Syncing...' : '🔄 Sync Calendar'}
        </button>
        {#if syncError}
          <p class="error">{syncError}</p>
        {/if}
        {#if $settings.lastIcalFetch}
          <p class="info">
            Last sync: {new Date($settings.lastIcalFetch).toLocaleTimeString()}
          </p>
        {/if}
      </div>

      <!-- Routine Selection -->
      <div class="control-group">
        <h3>Load Routine</h3>
        <div class="routine-buttons">
          {#each Object.entries(defaultRoutines) as [key, routine]}
            <button
              class="routine-btn"
              class:active={$timerState.currentRoutine === key}
              onclick={() => handleLoadRoutine(key)}
            >
              {routine.name}
            </button>
          {/each}
        </div>
      </div>

      <!-- Schedule Editor -->
      <div class="control-group">
        <h3>Edit Schedule</h3>
        <div class="schedule-list">
          {#each editSchedule as item, index}
            {@const activity = getActivity(item.activity)}
            <div class="schedule-item" class:current={index === $timerState.currentIndex} class:dragging={draggingIndex === index}>
              <button
                class="drag-handle"
                onpointerdown={(e) => handlePointerDown(index, e)}
                onpointermove={handlePointerMove}
                onpointerup={handlePointerUp}
                onpointercancel={handlePointerUp}
              >⠿</button>
              <span class="item-icon">{activity.icon}</span>
              <span class="item-name">{activity.name}</span>
              <input
                type="number"
                class="duration-input"
                value={item.duration}
                min="1"
                max="120"
                onchange={(e) => updateDuration(index, parseInt((e.target as HTMLInputElement).value) || 1)}
              />
              <span class="duration-label">min</span>
              <button class="icon-btn danger" onclick={() => removeActivity(index)}>✕</button>
            </div>
          {/each}
        </div>

        <!-- Add Activity -->
        <div class="add-activity">
          <select class="select small" id="add-activity-select">
            {#each activityList as activity}
              <option value={activity.id}>{activity.icon} {activity.name}</option>
            {/each}
          </select>
          <button
            class="ctrl-btn secondary small"
            onclick={() => {
              const select = document.getElementById('add-activity-select') as HTMLSelectElement;
              addActivity(select.value);
            }}
          >
            + Add
          </button>
        </div>

      </div>

      <!-- Restart -->
      <div class="control-group">
        <button class="ctrl-btn warning" onclick={restart}>🔄 Restart Schedule</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .parent-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    z-index: 200;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .parent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
  }

  .parent-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: white;
    letter-spacing: 1px;
  }

  .close-btn {
    width: 50px;
    height: 50px;
    font-size: 24px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .parent-content {
    padding: 24px;
    padding-bottom: 100px;
    max-width: 600px;
    margin: 0 auto;
  }

  .control-group {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 20px;
  }

  .control-group h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .button-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .button-row:last-child {
    margin-bottom: 0;
  }

  .ctrl-btn {
    flex: 1;
    padding: 18px 24px;
    font-size: 17px;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .ctrl-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  }

  .ctrl-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ctrl-btn.secondary {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }

  .ctrl-btn.warning {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }

  .ctrl-btn.small {
    padding: 12px 16px;
    font-size: 14px;
    flex: 0 0 auto;
  }

  .input,
  .select {
    width: 100%;
    padding: 18px;
    font-size: 17px;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  .select option {
    background: #1e293b;
    color: white;
  }

  .select.small {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    margin-bottom: 0;
  }

  .error {
    color: #f87171;
    font-size: 14px;
    margin-top: 8px;
  }

  .info {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    margin-top: 8px;
  }

  .schedule-list {
    margin-bottom: 16px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
  }

  .schedule-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .schedule-item:last-child {
    margin-bottom: 0;
  }

  .schedule-item.current {
    background: rgba(74, 222, 128, 0.2);
    border: 2px solid rgba(74, 222, 128, 0.5);
  }

  .item-icon {
    font-size: 24px;
  }

  .item-name {
    flex: 1;
    font-weight: 700;
    font-size: 14px;
    color: white;
  }

  .duration-input {
    width: 60px;
    padding: 8px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-align: center;
  }

  .duration-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .icon-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .icon-btn.danger:hover {
    background: rgba(239, 68, 68, 0.5);
  }

  .routine-buttons {
    display: flex;
    gap: 8px;
  }

  .routine-btn {
    flex: 1;
    min-width: 0;
    padding: 14px 8px;
    font-size: 14px;
    font-weight: 700;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .routine-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .routine-btn.active {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    border-color: #22c55e;
    color: white;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  }

  .drag-handle {
    cursor: grab;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
    background: none;
    border: none;
    padding: 4px 2px;
    touch-action: none;
    user-select: none;
    line-height: 1;
  }

  .drag-handle:active {
    cursor: grabbing;
    color: rgba(255, 255, 255, 0.8);
  }

  .schedule-item.dragging {
    background: rgba(74, 222, 128, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10;
    position: relative;
  }

  .add-activity {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
</style>
