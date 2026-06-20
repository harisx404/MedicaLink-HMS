import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MButton } from '../../components/MButton';
import { useAuthStore } from '../../store/authStore';

export function UnauthorizedScreen() {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-6xl mb-4">⛔</Text>
      <Text className="text-2xl font-bold text-slate-900 mb-2">Access Denied</Text>
      <Text className="text-slate-500 text-center mb-8">
        You do not have permission to view this section. If you believe this is an error, please contact your administrator.
      </Text>
      
      <MButton 
        label="Log Out & Switch Account" 
        onPress={logout}
        className="w-full"
      />
    </SafeAreaView>
  );
}
