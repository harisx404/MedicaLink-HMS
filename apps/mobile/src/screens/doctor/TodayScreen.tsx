import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/Avatar';
import { MCard } from '../../components/MCard';
import { SectionHeader } from '../../components/SectionHeader';
import { MBadge } from '../../components/MBadge';
import { Video, Clock, AlertCircle } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';
import { ConfirmSheet } from '../../components/ConfirmSheet';
import type BottomSheet from '@gorhom/bottom-sheet';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: 'VIDEO' | 'IN_PERSON';
  status: 'WAITING' | 'UPCOMING' | 'COMPLETED';
}

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patientName: 'John Doe', time: '09:00 AM', type: 'VIDEO', status: 'WAITING' },
  { id: '2', patientName: 'Alice Smith', time: '09:30 AM', type: 'IN_PERSON', status: 'UPCOMING' },
  { id: '3', patientName: 'Bob Johnson', time: '10:00 AM', type: 'IN_PERSON', status: 'UPCOMING' },
];

export function TodayScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-200">
        <View className="flex-row items-center flex-1">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={48} />
          <View className="ml-3 flex-1">
            <Text className="text-slate-500 text-sm">Today's Schedule,</Text>
            <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
              Dr. {user?.lastName}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
          <Text className="text-xl">🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row px-6 py-6 space-x-4">
          <MCard className="flex-1 items-center justify-center bg-indigo-600 border-0">
            <Text className="text-3xl font-bold text-white mb-1">12</Text>
            <Text className="text-indigo-100 font-medium text-xs text-center">Total Patients</Text>
          </MCard>
          <MCard className="flex-1 items-center justify-center bg-teal-600 border-0 ml-4">
            <Text className="text-3xl font-bold text-white mb-1">4</Text>
            <Text className="text-teal-100 font-medium text-xs text-center">Remaining</Text>
          </MCard>
        </View>

        <SectionHeader title="Up Next" />
        <View className="px-6 mb-8">
          <MCard className="p-5 border-l-4 border-l-amber-500">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-slate-900 text-lg font-bold">John Doe</Text>
                <View className="flex-row items-center mt-1">
                  <Clock color={tokens.colors.text.muted} size={14} />
                  <Text className="text-slate-500 ml-1 text-sm font-medium">09:00 AM - 09:30 AM</Text>
                </View>
              </View>
              <MBadge label="WAITING" variant="warning" size="sm" />
            </View>

            <View className="flex-row items-center bg-slate-50 p-3 rounded-lg mb-4">
              <AlertCircle color={tokens.colors.text.muted} size={16} />
              <Text className="text-slate-600 ml-2 text-sm">Patient has reported chest pain.</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Video color={tokens.colors.primary.DEFAULT} size={20} />
                <Text className="text-indigo-600 font-bold ml-2">Video Consult</Text>
              </View>
              <TouchableOpacity
                className="bg-indigo-600 px-4 py-2 rounded-lg"
                onPress={() => sheetRef.current?.expand()}
              >
                <Text className="text-white font-bold">Start</Text>
              </TouchableOpacity>
            </View>
          </MCard>
        </View>

        <SectionHeader title="Later Today" />
        <View className="px-6 space-y-4 mb-8">
          {MOCK_APPOINTMENTS.slice(1).map(apt => (
            <MCard key={apt.id} className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-slate-50 rounded-full items-center justify-center mr-4">
                  <Text className="text-slate-500 font-medium">{apt.time.split(' ')[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base">{apt.patientName}</Text>
                  <Text className="text-slate-500 text-sm">{apt.type === 'IN_PERSON' ? 'Clinic Visit' : 'Video'}</Text>
                </View>
              </View>
              <Text className="text-slate-400">›</Text>
            </MCard>
          ))}
        </View>
      </ScrollView>

      <ConfirmSheet
        ref={sheetRef}
        title="Start Consultation"
        message="Are you ready to join the video call with John Doe?"
        confirmLabel="Join Call"
        onConfirm={() => sheetRef.current?.close()}
        onCancel={() => sheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}
