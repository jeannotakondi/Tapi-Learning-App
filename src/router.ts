import { useSyncExternalStore } from 'react';

/**
 * Minimal hash router. Hash URLs work from a file, an app-store wrapper or a
 * static host without server rewrites. Routes:
 *   #/                     who is playing
 *   #/map                  island map for the active child
 *   #/lesson/<id>          a lesson
 *   #/grown-ups            profiles
 *   #/grown-ups/new        add a child
 *   #/grown-ups/<id>       one child's progress and settings
 */
export type Route =
  | { name: 'picker' }
  | { name: 'map' }
  | { name: 'lesson'; lessonId: string }
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
    case 'parent-home':
      return '#/grown-ups';
    case 'parent-new':
      return '#/grown-ups/new';
    case 'parent-child':
      return `#/grown-ups/${encodeURIComponent(route.profileId)}`;
  }
}

export function navigate(route: Route, { replace = false } = {}) {
  const hash = routeToHash(route);
  if (replace) window.location.replace(hash);
  else window.location.hash = hash;
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parseRoute(hash);
}
