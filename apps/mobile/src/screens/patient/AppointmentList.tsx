import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { MBadge } from '../../components/MBadge';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { PatientTabParamList, AppointmentsStackParamList } from '../../navigation/types';
import { Calendar } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';

type AppointmentListNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<PatientTabParamList, 'Appointments'>,
  StackNavigationProp<AppointmentsStackParamList>
>;

type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED';
type BadgeVariant = 'success' | 'warning' | 'default';

interface AppointmentItem {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  status: AppointmentStatus;
  type: 'VIDEO' | 'IN_PERSON';
}

const BADGE_VARIANT: Record<AppointmentStatus, BadgeVariant> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  COMPLETED: 'default',
};

const MOCK_APPOINTMENTS: AppointmentItem[] = [
  { id: '1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiology', date: 'Tomorrow, 10:00 AM', status: 'CONFIRMED', type: 'VIDEO' },
  { id: '2', doctorName: 'Dr. Michael Chen', specialty: 'General Practice', date: 'Oct 28, 2:30 PM', status: 'PENDING', type: 'IN_PERSON' },
  { id: '3', doctorName: 'Dr. Emily Ross', specialty: 'Dermatology', date: 'Sep 10, 11:00 AM', status: 'COMPLETED', type: 'IN_PERSON' },
];

export function AppointmentList() {
  const [filter, setFilter] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const navigation = useNavigation<AppointmentListNavProp>();

  const filtered = MOCK_APPOINTMENTS.filter(a => 
    filter === 'UPCOMING' ? a.status !== 'COMPLETED' : a.status === 'COMPLETED'
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="My Appointments" />
      
      {/* Tabs */}
      <View className="flex-row p-4 bg-white border-b border-slate-200">
        <TouchableOpacity 
          className={`flex-1 py-2 items-center border-b-2 ${filter === 'UPCOMING' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('UPCOMING')}
        >
          <Text className={`font-bold ${filter === 'UPCOMING' ? 'text-indigo-600' : 'text-slate-500'}`}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2 items-center border-b-2 ${filter === 'PAST' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('PAST')}
        >
          <Text className={`font-bold ${filter === 'PAST' ? 'text-indigo-600' : 'text-slate-500'}`}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm shadow-slate-100 elevation-1">
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-lg font-bold text-slate-900">{item.doctorName}</Text>
                <Text className="text-slate-500">{item.specialty}</Text>
              </View>
              <View className="bg-slate-100 rounded-full p-2">
                <Calendar color={tokens.colors.primary.DEFAULT} size={20} />
              </View>
            </View>
            
            <View className="flex-row items-center mb-4">
              <Text className="text-slate-700 font-medium mr-3">{item.date}</Text>
              <Text className="text-slate-400 text-xs mr-3">•</Text>
              <Text className="text-slate-700">{item.type === 'VIDEO' ? '🎥 Video' : '🏥 Clinic'}</Text>
            </View>

            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
              <MBadge 
                label={item.status} 
                variant={BADGE_VARIANT[item.status]} 
                size="sm"
              />
              {filter === 'UPCOMING' && (
                <TouchableOpacity>
                  <Text className="text-indigo-600 font-medium text-sm">Reschedule</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-md shadow-indigo-200 elevation-3"
        onPress={() => navigation.navigate('SpecialtySelect')}
      >
        <Text className="text-white text-3xl pb-1">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
