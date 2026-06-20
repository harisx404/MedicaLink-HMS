import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between mb-4 px-4">
      <Text className="text-lg font-bold text-slate-900">{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-indigo-600 font-medium text-sm">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
