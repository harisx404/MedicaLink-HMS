import React from 'react';
import { View, ViewProps } from 'react-native';

interface MCardProps extends ViewProps {
  elevated?: boolean;
}

export function MCard({ children, className = '', elevated = true, ...props }: MCardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-4 ${elevated ? 'shadow-sm shadow-slate-200 elevation-2' : 'border border-slate-200'} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
