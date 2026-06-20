import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface MBadgeProps extends ViewProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export function MBadge({ label, variant = 'default', size = 'md', className = '', ...props }: MBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case 'success': return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'warning': return { bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'danger': return { bg: 'bg-red-100', text: 'text-red-700' };
      case 'info': return { bg: 'bg-blue-100', text: 'text-blue-700' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700' };
    }
  };

  const { bg, text } = getStyles();
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`${bg} ${padding} rounded-full self-start ${className}`} {...props}>
      <Text className={`${text} ${textSize} font-medium`}>{label}</Text>
    </View>
  );
}
