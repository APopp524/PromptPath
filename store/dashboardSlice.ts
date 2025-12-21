/**
 * Dashboard Slice
 * 
 * Session-level cache for dashboard session logs.
 * 
 * This slice prevents repeated API calls to fetch session logs on the dashboard.
 * The logs are fetched once per session when the dashboard is first visited,
 * and then read from Redux on subsequent visits or re-renders.
 * 
 * Note: This slice is NOT persisted to localStorage. Session logs should be
 * fetched fresh on each app session. This is session-level caching only.
 * 
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionLog } from '../types';

type DashboardStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface DashboardState {
  sessionLogs: SessionLog[];
  status: DashboardStatus;
  error: string | null;
}

const initialState: DashboardState = {
  sessionLogs: [],
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /**
     * Set loading state when fetching session logs
     */
    setSessionLogsLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    /**
     * Set session logs (on successful fetch)
     */
    setSessionLogs: (state, action: PayloadAction<SessionLog[]>) => {
      state.sessionLogs = action.payload;
      state.status = 'loaded';
      state.error = null;
    },
    /**
     * Add a new session log (e.g., after creating one)
     */
    addSessionLog: (state, action: PayloadAction<SessionLog>) => {
      state.sessionLogs.push(action.payload);
    },
    /**
     * Set error state when fetch fails
     */
    setSessionLogsError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    /**
     * Clear session logs (e.g., on logout)
     */
    clearSessionLogs: (state) => {
      state.sessionLogs = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const {
  setSessionLogs,
  setSessionLogsLoading,
  setSessionLogsError,
  addSessionLog,
  clearSessionLogs,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
