import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MButton } from '../../../components/MButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';
import { tokens } from '../../../lib/tokens';
import { format } from 'date-fns';

export function BookingSuccess() {
  const route = useRoute();
  const navigation = useNavigation();
  const { doctorName, date, slot } = route.params as any;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <View className="items-center mb-8">
        <View className="mb-6 bg-green-50 p-6 rounded-full">
          <CheckCircle2 color={tokens.colors.success.DEFAULT} size={80} />
        </View>
        <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">Booking Confirmed!</Text>
        <Text className="text-slate-500 text-center text-lg mb-8">
          Your appointment has been successfully scheduled.
        </Text>

        <View className="bg-white p-6 rounded-2xl border border-slate-200 w-full mb-8 shadow-sm shadow-slate-100 elevation-1">
          <Text className="text-sm font-medium text-slate-500 mb-1">Doctor</Text>
          <Text className="text-lg font-bold text-slate-900 mb-4">{doctorName}</Text>
          
          <Text className="text-sm font-medium text-slate-500 mb-1">Date & Time</Text>
          <Text className="text-lg font-bold text-slate-900">
            {format(new Date(date), 'EEEE, MMM d, yyyy')} at {slot}
          </Text>
        </View>
      </View>

      <MButton 
        label="Done" 
        onPress={() => (navigation as any).navigate('AppointmentListTab')} 
      />
    </SafeAreaView>
  );
}
