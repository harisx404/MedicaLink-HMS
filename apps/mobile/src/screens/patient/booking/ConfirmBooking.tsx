import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { MButton } from '../../../components/MButton';
import { MCard } from '../../../components/MCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppointmentsStackParamList } from '../../../navigation/types';
import { format } from 'date-fns';

const PLATFORM_FEE = 5;

type ConfirmBookingRouteProp = RouteProp<AppointmentsStackParamList, 'ConfirmBooking'>;
type ConfirmBookingNavProp = StackNavigationProp<AppointmentsStackParamList, 'ConfirmBooking'>;

export function ConfirmBooking() {
  const route = useRoute<ConfirmBookingRouteProp>();
  const navigation = useNavigation<ConfirmBookingNavProp>();
  const { doctorName, date, slot, consultationFee } = route.params;

  const [isLoading, setIsLoading] = useState(false);

  const total = consultationFee + PLATFORM_FEE;

  const handleConfirm = () => {
    setIsLoading(true);
    // Simulate external payment gateway processing and booking confirmation
    // In production, this would use the RTK Query useMutation hook for the booking API
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('BookingSuccess', { doctorName, date, slot });
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Confirm Booking" showBack />

      <ScrollView className="flex-1 px-6 pt-6">
        <MCard className="mb-6">
          <Text className="text-sm font-medium text-slate-500 mb-1">Doctor</Text>
          <Text className="text-lg font-bold text-slate-900 mb-4">{doctorName}</Text>

          <Text className="text-sm font-medium text-slate-500 mb-1">Date & Time</Text>
          <Text className="text-lg font-bold text-slate-900 mb-4">
            {format(new Date(date), 'EEEE, MMM d, yyyy')} at {slot}
          </Text>

          <Text className="text-sm font-medium text-slate-500 mb-1">Type</Text>
          <Text className="text-lg font-bold text-slate-900 mb-4">Video Consultation</Text>

          <View className="h-px bg-slate-200 my-4" />

          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-500">Consultation Fee</Text>
            <Text className="text-slate-900 font-medium">${consultationFee.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-slate-500">Platform Fee</Text>
            <Text className="text-slate-900 font-medium">${PLATFORM_FEE.toFixed(2)}</Text>
          </View>

          <View className="h-px bg-slate-200 my-4" />

          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-slate-900">Total Pay</Text>
            <Text className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</Text>
          </View>
        </MCard>
      </ScrollView>

      <View className="p-6 bg-white border-t border-slate-200">
        <MButton
          label="Confirm & Pay"
          onPress={handleConfirm}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
