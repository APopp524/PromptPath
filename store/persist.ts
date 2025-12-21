/**
 * Centralized localStorage Persistence Utility
 * 
 * This module handles all localStorage interactions for Redux state persistence.
 * It provides a single point of access for persisting and loading state,
 * ensuring consistency and SSR safety.
 * 
 * Key Features:
 * - SSR-safe: All functions check for window availability (Next.js compatibility)
 * - Error handling: Gracefully handles localStorage errors (quota exceeded, etc.)
 * - Type-safe: TypeScript interfaces ensure data structure consistency
 * 
 * Storage Key: 'promptpath_redux_state'
 * 
 * Note: Only the preferences slice is persisted. User state is not persisted
 * as it should be fetched from Supabase on each session.
 */

const STORAGE_KEY = 'promptpath_redux_state';

/**
 * Structure of persisted state in localStorage
 * 
 * This matches the preferences slice structure, but uses string types
 * for tool and taskType since they're serialized as JSON.
 */
interface PersistedState {
  preferences: {
    lastUsedTool: string | null;
    lastUsedTaskType: string | null;
    lastUsedTimeSaved: number | null;
  };
}

export type { PersistedState };

/**
 * Load persisted state from localStorage
 * 
 * Called once during store initialization to hydrate Redux state with
 * previously saved preferences.
 * 
 * @returns The persisted state object, or null if not found or on SSR
 * 
 * SSR Safety: Returns null if window is undefined (Next.js server-side rendering)
 */
export function loadPersistedState(): Partial<PersistedState> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PersistedState;
    }
  } catch (e) {
    // Handle JSON parse errors or corrupted data gracefully
    console.warn('Failed to load persisted state from localStorage:', e);
  }

  return null;
}

/**
 * Save state to localStorage
 * 
 * Called automatically by the persistence middleware whenever preferences
 * slice changes. This ensures preferences are always up-to-date in storage.
 * 
 * @param state - The state object to persist (currently only preferences)
 * 
 * SSR Safety: No-op if window is undefined (Next.js server-side rendering)
 */
export function savePersistedState(state: PersistedState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Handle quota exceeded or other localStorage errors gracefully
    console.warn('Failed to save persisted state to localStorage:', e);
  }
}

/**
 * Clear persisted state from localStorage
 * 
 * Typically called on user logout to remove all persisted preferences.
 * 
 * SSR Safety: No-op if window is undefined (Next.js server-side rendering)
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear persisted state from localStorage:', e);
  }
}
