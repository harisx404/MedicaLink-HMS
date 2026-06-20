import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { MButton } from '../../../components/MButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppointmentsStackParamList } from '../../../navigation/types';
import { format, addDays } from 'date-fns';

/** Default consultation fee — overridden by doctor data when available. */
const DEFAULT_CONSULTATION_FEE = 150;

type DateSelectRouteProp = RouteProp<AppointmentsStackParamList, 'DateSelect'>;
type DateSelectNavProp = StackNavigationProp<AppointmentsStackParamList, 'DateSelect'>;

export function DateSelect() {
  const route = useRoute<DateSelectRouteProp>();
  const navigation = useNavigation<DateSelectNavProp>();
  const { specialtyId, specialtyName, doctorId, doctorName } = route.params;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Select Date" showBack />

      <View className="px-6 py-6 border-b border-slate-200 bg-white">
        <Text className="text-lg font-bold text-slate-900 mb-1">{doctorName}</Text>
        <Text className="text-slate-500">Choose an available date for your appointment.</Text>
      </View>

      <FlatList
        data={dates}
        keyExtractor={item => item.toISOString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isSelected = format(item, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          return (
            <TouchableOpacity
              className={`p-4 rounded-xl mb-3 border ${isSelected ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-200'}`}
              onPress={() => setSelectedDate(item)}
            >
              <Text className={`text-lg font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                {format(item, 'EEEE, MMM d')}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View className="p-6 bg-white border-t border-slate-200">
        <MButton
          label="Continue to Slots"
          onPress={() => navigation.navigate('SlotSelect', {
            specialtyId,
            specialtyName,
            doctorId,
            doctorName,
            date: selectedDate.toISOString(),
            consultationFee: DEFAULT_CONSULTATION_FEE,
          })}
        />
      </View>
    </SafeAreaView>
  );
}
