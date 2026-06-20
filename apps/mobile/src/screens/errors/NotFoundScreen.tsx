import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MButton } from '../../components/MButton';
import { useNavigation } from '@react-navigation/native';

export function NotFoundScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</Text>
      <Text className="text-slate-500 text-center mb-8">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </Text>
      
      <MButton 
        label="Go Home" 
        onPress={() => (navigation as any).navigate('Home')}
        className="w-full"
      />
    </SafeAreaView>
  );
}
