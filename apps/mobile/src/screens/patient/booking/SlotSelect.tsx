import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { MButton } from '../../../components/MButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppointmentsStackParamList } from '../../../navigation/types';
import { format } from 'date-fns';

/** Default consultation fee used when the slot data doesn't include pricing. */
const DEFAULT_CONSULTATION_FEE = 150;
const PLATFORM_FEE = 5;

const MOCK_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM',
];

type SlotSelectRouteProp = RouteProp<AppointmentsStackParamList, 'SlotSelect'>;
type SlotSelectNavProp = StackNavigationProp<AppointmentsStackParamList, 'SlotSelect'>;

export function SlotSelect() {
  const route = useRoute<SlotSelectRouteProp>();
  const navigation = useNavigation<SlotSelectNavProp>();
  const { doctorId, doctorName, date, consultationFee } = route.params;

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const fee = consultationFee ?? DEFAULT_CONSULTATION_FEE;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Select Time" showBack />

      <View className="px-6 py-6 border-b border-slate-200 bg-white">
        <Text className="text-lg font-bold text-slate-900 mb-1">
          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text className="text-slate-500">{doctorName}</Text>
        <Text className="text-indigo-600 font-medium mt-1">Consultation: ${fee.toFixed(2)}</Text>
      </View>

      <FlatList
        data={MOCK_SLOTS}
        keyExtractor={item => item}
        contentContainerStyle={{ padding: 16 }}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => {
          const isSelected = item === selectedSlot;
          return (
            <TouchableOpacity
              className={`p-3 rounded-xl mb-4 w-[31%] items-center border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
              onPress={() => setSelectedSlot(item)}
            >
              <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View className="p-6 bg-white border-t border-slate-200">
        <MButton
          label="Review Booking"
          onPress={() => {
            if (selectedSlot) {
              navigation.navigate('ConfirmBooking', {
                doctorId,
                doctorName,
                date,
                slot: selectedSlot,
                consultationFee: fee,
              });
            }
          }}
          disabled={!selectedSlot}
        />
      </View>
    </SafeAreaView>
  );
}
