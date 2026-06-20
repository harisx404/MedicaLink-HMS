import React from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Text } from 'react-native';

interface MSearchInputProps extends TextInputProps {
  onClear?: () => void;
}

export function MSearchInput({ value, onClear, className = '', ...props }: MSearchInputProps) {
  return (
    <View className={`flex-row items-center h-12 bg-slate-100 rounded-xl px-4 ${className}`}>
      <Text className="text-slate-400 mr-2 text-lg">🔍</Text>
      <TextInput
        className="flex-1 text-slate-900"
        placeholderTextColor="#9ca3af"
        value={value}
        {...props}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear} className="ml-2 p-1 bg-slate-200 rounded-full w-6 h-6 items-center justify-center">
          <Text className="text-slate-500 text-xs font-bold">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
