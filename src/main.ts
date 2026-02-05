import { mount } from 'svelte'
import App from './App.svelte'
import { initializeFromServer } from './lib/stores/timer'

const app = mount(App, {
  target: document.getElementById('app')!,
})

// Load state from server (async, will update stores when ready)
initializeFromServer()

export default app
