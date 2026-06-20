import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MButton } from '../../components/MButton';
import { useOfflineStore } from '../../store/offlineStore';

export function MaintenanceScreen() {
  const { isOnline } = useOfflineStore();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-6xl mb-4">🛠️</Text>
      <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">System Maintenance</Text>
      <Text className="text-slate-500 text-center mb-8">
        MedicaLink HMS is currently undergoing scheduled maintenance to improve our services. Please check back soon.
      </Text>
      
      {!isOnline && (
        <MButton 
          label="View Offline Records" 
          onPress={() => {}}
          className="w-full"
          variant="outline"
        />
      )}
    </SafeAreaView>
  );
}
