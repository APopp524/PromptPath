/**
 * Preferences Slice
 * 
 * Manages UI preferences that should persist across sessions.
 * This slice is automatically persisted to localStorage via the persistence
 * middleware in store/index.ts.
 * 
 * Current preferences:
 * - lastUsedTool: The last AI tool selected in the session log form
 * - lastUsedTaskType: The last task type selected in the session log form
 * - lastUsedTimeSaved: The last time saved value entered in the session log form
 * 
 * Usage:
 *   import { useAppDispatch, useAppSelector } from '../store';
 *   import { setLastUsedValues, clearPreferences } from '../store/preferencesSlice';
 * 
 *   // In component:
 *   const dispatch = useAppDispatch();
 *   const preferences = useAppSelector((state) => state.preferences);
 *   
 *   // Update preferences (automatically persisted)
 *   dispatch(setLastUsedValues({ tool: 'Cursor', taskType: 'Debugging', timeSaved: 30 }));
 *   
 *   // Clear all preferences (e.g., on logout)
 *   dispatch(clearPreferences());
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tool, TaskType } from '../types';

interface PreferencesState {
  lastUsedTool: Tool | null;
  lastUsedTaskType: TaskType | null;
  lastUsedTimeSaved: number | null;
}

const initialState: PreferencesState = {
  lastUsedTool: null,
  lastUsedTaskType: null,
  lastUsedTimeSaved: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    /**
     * Update last-used form values
     * 
     * All fields are optional - only provided fields will be updated.
     * This allows partial updates (e.g., just updating the tool).
     * 
     * @param action - Partial preferences object with any combination of:
     *   - tool: The AI tool that was used
     *   - taskType: The type of task performed
     *   - timeSaved: The time saved in minutes
     */
    setLastUsedValues: (
      state,
      action: PayloadAction<{
        tool?: Tool;
        taskType?: TaskType;
        timeSaved?: number;
      }>
    ) => {
      // Only update fields that are explicitly provided
      if (action.payload.tool !== undefined) {
        state.lastUsedTool = action.payload.tool;
      }
      if (action.payload.taskType !== undefined) {
        state.lastUsedTaskType = action.payload.taskType;
      }
      if (action.payload.timeSaved !== undefined) {
        state.lastUsedTimeSaved = action.payload.timeSaved;
      }
    },
    /**
     * Clear all preferences
     * 
     * Typically called on user logout to reset form defaults.
     * This action will also clear the persisted localStorage data.
     */
    clearPreferences: (state) => {
      state.lastUsedTool = null;
      state.lastUsedTaskType = null;
      state.lastUsedTimeSaved = null;
    },
  },
});

export const { setLastUsedValues, clearPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
