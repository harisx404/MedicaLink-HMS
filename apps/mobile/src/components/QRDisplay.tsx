import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { MCard } from './MCard';

interface QRDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRDisplay({ value, size = 200, label }: QRDisplayProps) {
  return (
    <MCard className="items-center justify-center p-6">
      <View className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <QRCode
          value={value}
          size={size}
          color="#111827"
          backgroundColor="white"
        />
      </View>
      {label && <Text className="mt-4 text-slate-500 font-medium">{label}</Text>}
    </MCard>
  );
}
