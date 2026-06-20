import React from 'react';
import { View, Text } from 'react-native';
import { useOfflineStore } from '../store/offlineStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function OfflineBanner() {
  const { isOnline, lastSyncAt } = useOfflineStore();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View 
      className="bg-amber-100 flex-row items-center justify-center px-4 py-2 border-b border-amber-200"
      style={{ paddingTop: Math.max(insets.top, 8) }}
    >
      <Text className="text-amber-800 text-sm font-medium mr-2">⚠️ You are offline</Text>
      {lastSyncAt && (
        <Text className="text-amber-700 text-xs">
          Last synced: {new Date(lastSyncAt).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}
