import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../store/offlineStore';
import { syncDatabase } from '../database/sync';

export function useNetworkListener() {
  const { setOnlineStatus, isOnline } = useOfflineStore();

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;
      setOnlineStatus(!!isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncDatabase();
    }
  }, [isOnline]);
}
