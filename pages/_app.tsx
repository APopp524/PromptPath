import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ToastProvider } from '../components/ui/Toast';
import store from '../store';
import { getCurrentUser, subscribeToAuthChanges } from '../controllers/authController';
import { setUser, setUserLoading, setUserError, clearUser } from '../store/userSlice';
import { clearSessionLogs } from '../store/dashboardSlice';
import { clearWeeklyInsights } from '../store/weeklyInsightsSlice';
import '../styles/globals.css';

/**
 * User Initialization Component
 * 
 * Fetches the authenticated user once per app session and stores it in Redux.
 * This prevents repeated calls to getCurrentUser() across components.
 */
function UserInitializer() {
  useEffect(() => {
    // Fetch initial user if not already loaded
    const initializeUser = async () => {
      const currentStatus = store.getState().user.status;
      if (currentStatus === 'idle') {
        store.dispatch(setUserLoading());
        try {
          const user = await getCurrentUser();
          store.dispatch(setUser(user));
        } catch (error) {
          store.dispatch(setUserError(error instanceof Error ? error.message : 'Failed to fetch user'));
        }
      }
    };

    initializeUser();

    // Subscribe to auth changes and sync with Redux
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        store.dispatch(setUser(user));
      } else {
        // User logged out - clear all session caches
        store.dispatch(clearUser());
        store.dispatch(clearSessionLogs());
        store.dispatch(clearWeeklyInsights());
      }
    });

    return unsubscribe;
  }, []);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <UserInitializer />
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </Provider>
  );
}

