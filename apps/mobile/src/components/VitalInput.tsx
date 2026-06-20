import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface VitalInputProps extends TextInputProps {
  label: string;
  unit: string;
  error?: string;
}

export function VitalInput({ label, unit, error, className = '', ...props }: VitalInputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-sm font-medium text-slate-700 mb-1">{label}</Text>
      <View className={`flex-row items-center h-12 bg-white rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'}`}>
        <TextInput
          className="flex-1 px-4 text-slate-900 text-lg font-medium"
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
          {...props}
        />
        <View className="h-full px-4 bg-slate-50 border-l border-slate-200 justify-center rounded-r-xl">
          <Text className="text-slate-500 font-medium">{unit}</Text>
        </View>
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
