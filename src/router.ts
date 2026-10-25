import { useSyncExternalStore } from 'react';

/**
 * Minimal hash router. Hash URLs work from a file, an app-store wrapper or a
 * static host without server rewrites. The current route is also kept in
 * memory, so navigation still works where the page can't change its own URL
 * (some embedded viewers). Routes:
 *   #/                     who is playing
 *   #/map                  island map for the active child
 *   #/lesson/<id>          a lesson
 *   #/story/<id>           an end-of-stage story
 *   #/placement            placement game for the active child
 *   #/grown-ups            profiles
 *   #/grown-ups/new        add a child
 *   #/grown-ups/<id>       one child's progress and settings
 */
export type Route =
  | { name: 'picker' }
  | { name: 'map' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'story'; storyId: string }
  | { name: 'placement' }
  | { name: 'parent-home' }
  | { name: 'parent-new' }
  | { name: 'parent-child'; profileId: string };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  switch (parts[0]) {
    case 'map':
      return { name: 'map' };
    case 'lesson':
      return parts[1] ? { name: 'lesson', lessonId: parts[1] } : { name: 'map' };
    case 'story':
      return parts[1] ? { name: 'story', storyId: parts[1] } : { name: 'map' };
    case 'placement':
      return { name: 'placement' };
    case 'grown-ups':
      if (!parts[1]) return { name: 'parent-home' };
      if (parts[1] === 'new') return { name: 'parent-new' };
      return { name: 'parent-child', profileId: parts[1] };
    default:
      return { name: 'picker' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'picker':
      return '#/';
    case 'map':
      return '#/map';
    case 'lesson':
      return `#/lesson/${encodeURIComponent(route.lessonId)}`;
    case 'story':
      return `#/story/${encodeURIComponent(route.storyId)}`;
    case 'placement':
      return '#/placement';
    case 'parent-home':
      return '#/grown-ups';
    case 'parent-new':
      return '#/grown-ups/new';
    case 'parent-child':
      return `#/grown-ups/${encodeURIComponent(route.profileId)}`;
  }
}

let currentHash = typeof window !== 'undefined' ? window.location.hash : '';
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function navigate(route: Route, { replace = false } = {}) {
  const hash = routeToHash(route);
  if (hash === currentHash) return;
  currentHash = hash;
  try {
    if (replace) window.location.replace(hash);
    else window.location.hash = hash;
  } catch {
    // The URL can't change here; the in-memory route still moves on.
  }
  notify();
}

function subscribe(listener: () => void) {
  const onHashChange = () => {
    currentHash = window.location.hash;
    notify();
  };
  listeners.add(listener);
  window.addEventListener('hashchange', onHashChange);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('hashchange', onHashChange);
  };
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => currentHash);
  return parseRoute(hash);
}
