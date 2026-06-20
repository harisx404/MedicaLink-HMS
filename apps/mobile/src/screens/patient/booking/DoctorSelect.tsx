import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { Avatar } from '../../../components/Avatar';
import { MCard } from '../../../components/MCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppointmentsStackParamList } from '../../../navigation/types';
import { Star } from 'lucide-react-native';

interface Doctor {
  id: string;
  name: string;
  rating: number;
  experience: string;
  fee: number;
}

const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Jenkins', rating: 4.9, experience: '15 years', fee: 150 },
  { id: '2', name: 'Dr. John Doe', rating: 4.7, experience: '8 years', fee: 120 },
];

type DoctorSelectRouteProp = RouteProp<AppointmentsStackParamList, 'DoctorSelect'>;
type DoctorSelectNavProp = StackNavigationProp<AppointmentsStackParamList, 'DoctorSelect'>;

export function DoctorSelect() {
  const route = useRoute<DoctorSelectRouteProp>();
  const navigation = useNavigation<DoctorSelectNavProp>();
  const { specialtyId, specialtyName } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title={specialtyName} showBack />

      <FlatList
        data={MOCK_DOCTORS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('DateSelect', {
              specialtyId,
              specialtyName,
              doctorId: item.id,
              doctorName: item.name,
            })}
          >
            <MCard className="mb-4 flex-row items-center">
              <Avatar name={item.name} size={64} className="mr-4" />
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900 mb-1">{item.name}</Text>
                <Text className="text-slate-500 text-sm mb-2">{specialtyName} • {item.experience}</Text>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded">
                    <Star color="#f59e0b" fill="#f59e0b" size={14} />
                    <Text className="text-amber-700 font-bold ml-1 text-xs">{item.rating}</Text>
                  </View>
                  <Text className="text-indigo-600 font-bold">${item.fee}</Text>
                </View>
              </View>
            </MCard>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
