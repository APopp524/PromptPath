/**
 * Weekly Insights Slice
 * 
 * Session-level cache for weekly summary data.
 * 
 * This slice prevents repeated API calls to fetch weekly insights on the
 * weekly summary page. The data is fetched once per session when the page
 * is first visited, and then read from Redux on subsequent visits or re-renders.
 * 
 * Note: This slice is NOT persisted to localStorage. Weekly insights should be
 * fetched fresh on each app session. This is session-level caching only.
 * 
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WeeklyInsights } from '../types';
import type { WeeklySummary } from '../controllers/weeklyController';

type WeeklyInsightsStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface WeeklyInsightsState {
  // Current week's computed summary (from session logs)
  currentWeek: WeeklySummary | null;
  // All past weeks' insights (from database)
  pastWeeks: WeeklyInsights[];
  status: WeeklyInsightsStatus;
  error: string | null;
}

const initialState: WeeklyInsightsState = {
  currentWeek: null,
  pastWeeks: [],
  status: 'idle',
  error: null,
};

const weeklyInsightsSlice = createSlice({
  name: 'weeklyInsights',
  initialState,
  reducers: {
    /**
     * Set loading state when fetching weekly insights
     */
    setWeeklyInsightsLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    /**
     * Set weekly insights data (on successful fetch)
     * Stores current week summary and all past weeks
     */
    setWeeklyInsights: (
      state,
      action: PayloadAction<{
        currentWeek: WeeklySummary | null;
        pastWeeks: WeeklyInsights[];
      }>
    ) => {
      state.currentWeek = action.payload.currentWeek;
      state.pastWeeks = action.payload.pastWeeks;
      state.status = 'loaded';
      state.error = null;
    },
    /**
     * Set error state when fetch fails
     */
    setWeeklyInsightsError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.currentWeek = null;
      state.pastWeeks = [];
    },
    /**
     * Clear weekly insights (e.g., on logout)
     */
    clearWeeklyInsights: (state) => {
      state.currentWeek = null;
      state.pastWeeks = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  setWeeklyInsights,
  setWeeklyInsightsLoading,
  setWeeklyInsightsError,
  clearWeeklyInsights,
} = weeklyInsightsSlice.actions;
export default weeklyInsightsSlice.reducer;
