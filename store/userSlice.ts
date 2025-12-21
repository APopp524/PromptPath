/**
 * User Slice
 * 
 * Manages the authenticated user state in Redux with session-level caching.
 * 
 * This slice acts as a session cache to prevent repeated calls to getCurrentUser().
 * The user is fetched once per app session and stored here. Components should
 * read from Redux instead of calling getCurrentUser() directly.
 * 
 * Note: This slice is NOT persisted to localStorage. User authentication
 * should be handled through Supabase, and the user state should be fetched
 * on each session. This slice is for client-side session caching only.
 * 
 * Usage:
 *   import { useAppDispatch, useAppSelector } from '../store';
 *   import { setUser, clearUser, setUserLoading, setUserError } from '../store/userSlice';
 * 
 *   // In component:
 *   const dispatch = useAppDispatch();
 *   const user = useAppSelector((state) => state.user.user);
 *   const userStatus = useAppSelector((state) => state.user.status);
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';

type UserStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface UserState {
  user: User | null;
  status: UserStatus;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set loading state when fetching user
     */
    setUserLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    /**
     * Set the authenticated user (on successful fetch)
     * @param action - The Supabase User object, or null to clear
     */
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'loaded' : 'idle';
      state.error = null;
    },
    /**
     * Set error state when user fetch fails
     */
    setUserError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.user = null;
    },
    /**
     * Clear the authenticated user (e.g., on logout)
     */
    clearUser: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { setUser, clearUser, setUserLoading, setUserError } = userSlice.actions;
export default userSlice.reducer;
