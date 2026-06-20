import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function AppHeader({ title, showBack = false, rightElement }: AppHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="bg-white px-4 pb-4 border-b border-slate-200 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3"
          >
            <Text className="text-slate-700 text-xl">←</Text>
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>{title}</Text>
      </View>
      {rightElement && (
        <View className="ml-4">
          {rightElement}
        </View>
      )}
    </View>
  );
}
