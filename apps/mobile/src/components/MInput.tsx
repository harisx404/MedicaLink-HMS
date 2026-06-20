import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';

interface MInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function MInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className = '',
  secureTextEntry,
  ...props
}: MInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-sm font-medium text-slate-700 mb-1">{label}</Text>}
      <View 
        className={`flex-row items-center h-12 bg-white rounded-xl px-3 border ${
          error ? 'border-red-500' : isFocused ? 'border-indigo-600' : 'border-slate-200'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-slate-900"
          placeholderTextColor="#9ca3af"
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2 p-1">
            <Text className="text-slate-400 text-xs">{isSecure ? 'SHOW' : 'HIDE'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress} className="ml-2">
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
