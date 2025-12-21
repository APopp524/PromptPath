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
import type { WeeklySummary } from '../controllers/weeklyController';

type WeeklyInsightsStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface WeeklyInsightsState {
  data: WeeklySummary | null;
  status: WeeklyInsightsStatus;
  error: string | null;
}

const initialState: WeeklyInsightsState = {
  data: null,
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
     */
    setWeeklyInsights: (state, action: PayloadAction<WeeklySummary>) => {
      state.data = action.payload;
      state.status = 'loaded';
      state.error = null;
    },
    /**
     * Set error state when fetch fails
     */
    setWeeklyInsightsError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.data = null;
    },
    /**
     * Clear weekly insights (e.g., on logout)
     */
    clearWeeklyInsights: (state) => {
      state.data = null;
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
