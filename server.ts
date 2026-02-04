import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const STATE_FILE = join(DATA_DIR, 'state.json');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');
const DIST_DIR = join(import.meta.dir, 'dist');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(path: string): unknown {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'));
    }
  } catch (e) {
    console.error(`Failed to read ${path}:`, e);
  }
  return null;
}

function writeJsonFile(path: string, data: unknown): boolean {
  try {
    writeFileSync(path, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(`Failed to write ${path}:`, e);
    return false;
  }
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // API routes
    if (path === '/api/state') {
      if (req.method === 'GET') {
        const state = readJsonFile(STATE_FILE);
        return Response.json(state || {});
      }
      if (req.method === 'POST') {
        const body = await req.json();
        const success = writeJsonFile(STATE_FILE, body);
        return Response.json({ success });
      }
    }

    if (path === '/api/settings') {
      if (req.method === 'GET') {
        const settings = readJsonFile(SETTINGS_FILE);
        return Response.json(settings || {});
      }
      if (req.method === 'POST') {
        const body = await req.json();
        const success = writeJsonFile(SETTINGS_FILE, body);
        return Response.json({ success });
      }
    }

    // Static file serving
    let filePath = join(DIST_DIR, path === '/' ? 'index.html' : path);

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // SPA fallback - serve index.html for client-side routing
    const indexFile = Bun.file(join(DIST_DIR, 'index.html'));
    if (await indexFile.exists()) {
      return new Response(indexFile);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
