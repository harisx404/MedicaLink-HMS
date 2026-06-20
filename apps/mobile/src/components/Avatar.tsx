import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, url, size = 48, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View 
      className={`bg-indigo-100 items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image source={{ uri: url }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text className="text-indigo-600 font-bold" style={{ fontSize: size * 0.4 }}>{initials}</Text>
      )}
    </View>
  );
}
