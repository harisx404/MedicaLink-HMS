import React, { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MButton } from './MButton';

interface ConfirmSheetProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmSheet = forwardRef<BottomSheet, ConfirmSheetProps>(
  ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, isDestructive, isLoading }, ref) => {
    const snapPoints = useMemo(() => ['30%'], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
        )}
      >
        <View className="p-6">
          <Text className="text-xl font-bold text-slate-900 mb-2 text-center">{title}</Text>
          <Text className="text-slate-500 text-center mb-6">{message}</Text>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <MButton label={cancelLabel} variant="outline" onPress={onCancel} disabled={isLoading} />
            </View>
            <View className="flex-1 ml-4">
              <MButton 
                label={confirmLabel} 
                variant={isDestructive ? 'danger' : 'primary'} 
                onPress={onConfirm} 
                isLoading={isLoading} 
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    );
  }
);
