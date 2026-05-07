import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useAuthStore } from '../../features/auth/store/authStore';

export const TOKEN_REFRESH_TASK = 'BACKGROUND_TOKEN_REFRESH';

TaskManager.defineTask(TOKEN_REFRESH_TASK, async () => {
  try {
    const { accessToken, renewToken } = useAuthStore.getState();
    
    if (!accessToken) {
      console.log('[BackgroundFetch] No access token found, skipping refresh.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('[BackgroundFetch] Triggering token renewal...');
    
    // Set a timeout for the refresh request to avoid piling up requests when offline
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Refresh token timeout')), 15000) // 15 seconds timeout
    );

    await Promise.race([
      renewToken(),
      timeoutPromise
    ]);

    console.log('[BackgroundFetch] Token renewal successful');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundFetch] Token renewal failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundRefreshTask() {
  console.log('[BackgroundFetch] Registering task...');
  try {
    const isRegistered = await BackgroundFetch.getStatusAsync();
    if (isRegistered !== BackgroundFetch.BackgroundFetchStatus.Available) {
       console.log('[BackgroundFetch] Background fetch is not available:', isRegistered);
       return;
    }

    await BackgroundFetch.registerTaskAsync(TOKEN_REFRESH_TASK, {
      minimumInterval: 30 * 60, // 30 minutes
      stopOnTerminate: false, // android only
      startOnBoot: true, // android only
    });
    console.log('[BackgroundFetch] Task registered successfully');
  } catch (err) {
    console.error('[BackgroundFetch] Registration failed:', err);
  }
}

export async function unregisterBackgroundRefreshTask() {
  return BackgroundFetch.unregisterTaskAsync(TOKEN_REFRESH_TASK);
}
