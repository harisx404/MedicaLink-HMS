import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { MButton } from './MButton';

interface EmptyStateProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  ...props
}: EmptyStateProps) {
  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`} {...props}>
      {icon && (
        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
          {icon}
        </View>
      )}
      <Text className="text-xl font-bold text-slate-900 mb-2 text-center">{title}</Text>
      {description && (
        <Text className="text-slate-500 text-center mb-8">{description}</Text>
      )}
      {actionLabel && onAction && (
        <MButton label={actionLabel} onPress={onAction} variant="outline" />
      )}
    </View>
  );
}
