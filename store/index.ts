/**
 * Redux Store Configuration
 * 
 * This is the central Redux store for PromptPath. It manages all client-side state
 * and handles persistence to localStorage automatically.
 * 
 * Architecture:
 * - Uses Redux Toolkit for simplified Redux setup
 * - Persists preferences slice to localStorage via middleware
 * - Provides typed hooks for TypeScript safety
 * - SSR-safe (guards localStorage access for Next.js)
 */

import { configureStore, Middleware } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import userReducer from './userSlice';
import preferencesReducer from './preferencesSlice';
import dashboardReducer from './dashboardSlice';
import weeklyInsightsReducer from './weeklyInsightsSlice';
import { loadPersistedState, savePersistedState } from './persist';
import type { Tool, TaskType } from '../types';

/**
 * Hydrate store with persisted state from localStorage on initialization
 * This happens once when the store is created, before any components mount.
 */
const persistedState = loadPersistedState();

/**
 * Persistence Middleware
 * 
 * Automatically saves preferences slice to localStorage whenever it changes.
 * This ensures user preferences persist across page refreshes and browser sessions.
 * 
 * Note: Only the preferences slice is persisted. User state is not persisted
 * as it should be fetched from Supabase on each session.
 */
const persistMiddleware: Middleware = (store) => (next) => (action) => {
  // Execute the action first
  const result = next(action);
  
  // Only persist preferences slice changes (not user or other slices)
  if (action.type?.startsWith('preferences/')) {
    // Get the updated state after the action has been processed
    const state = store.getState();
    savePersistedState({
      preferences: {
        lastUsedTool: state.preferences.lastUsedTool as string | null,
        lastUsedTaskType: state.preferences.lastUsedTaskType as string | null,
        lastUsedTimeSaved: state.preferences.lastUsedTimeSaved,
      },
    });
  }
  
  return result;
};

/**
 * Redux Store
 * 
 * Configured with:
 * - user: Session cache for authenticated user (not persisted)
 * - preferences: UI preferences like last-used form values (persisted to localStorage)
 * - dashboard: Session cache for dashboard session logs (not persisted)
 * - weeklyInsights: Session cache for weekly summary data (not persisted)
 * 
 * Note: Only preferences are persisted. Other slices are session-level caches
 * that reset on page refresh to ensure fresh data from Supabase.
 */
const store = configureStore({
  reducer: {
    user: userReducer,
    preferences: preferencesReducer,
    dashboard: dashboardReducer,
    weeklyInsights: weeklyInsightsReducer,
  },
  // Preload persisted preferences on store initialization
  preloadedState: persistedState
    ? {
        preferences: {
          lastUsedTool: persistedState.preferences.lastUsedTool as Tool | null,
          lastUsedTaskType: persistedState.preferences.lastUsedTaskType as TaskType | null,
          lastUsedTimeSaved: persistedState.preferences.lastUsedTimeSaved,
        },
      }
    : undefined,
  // Add persistence middleware to automatically save preferences
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware),
});

/**
 * TypeScript Types
 * 
 * Export types for use in components to ensure type safety when accessing
 * Redux state and dispatching actions.
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed Hooks
 * 
 * Use these hooks in components instead of the raw react-redux hooks.
 * They provide full TypeScript type inference for the Redux store.
 * 
 * Example usage:
 *   const dispatch = useAppDispatch();
 *   const preferences = useAppSelector((state) => state.preferences);
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
