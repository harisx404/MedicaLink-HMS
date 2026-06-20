import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/Avatar';
import { MCard } from '../../components/MCard';
import { MBadge } from '../../components/MBadge';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Calendar, Stethoscope, FileText, Pill } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { PatientTabParamList } from '../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

type PatientHomeNavProp = BottomTabNavigationProp<PatientTabParamList, 'Home'>;

interface UpcomingAppointment {
  doctorName: string;
  specialty: string;
  datetime: string;
  type: string;
  status: string;
}

interface RecentRecord {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface DashboardData {
  upcomingAppointment: UpcomingAppointment | null;
  recentRecords: RecentRecord[];
}

async function fetchPatientDashboard(): Promise<DashboardData> {
  const response = await api.get<{ data: DashboardData }>('/patients/me/dashboard');
  return response.data.data;
}

export function PatientHome() {
  const { user } = useAuthStore();
  const navigation = useNavigation<PatientHomeNavProp>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['patientDashboard'],
    queryFn: fetchPatientDashboard,
    // Gracefully fall back to mock data if API isn't available yet
    retry: false,
  });

  const upcomingAppointment = data?.upcomingAppointment ?? {
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    datetime: 'Tomorrow, 10:00 AM',
    type: 'Video Consult',
    status: 'CONFIRMED',
  };

  const recentRecords: RecentRecord[] = data?.recentRecords ?? [
    { id: '1', title: 'Complete Blood Count', date: 'Oct 24, 2026', type: 'Lab Result' },
    { id: '2', title: 'Cardiology Consultation', date: 'Sep 15, 2026', type: 'Prescription' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-slate-200">
        <View className="flex-row items-center flex-1">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={48} />
          <View className="ml-3 flex-1">
            <Text className="text-slate-500 text-sm">Welcome back,</Text>
            <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
          <Text className="text-xl">🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {/* Quick Actions */}
        <View className="flex-row flex-wrap justify-between px-6 py-6">
          <QuickAction
            icon={<Calendar color={tokens.colors.primary.DEFAULT} size={24} />}
            label="Book Appointment"
            onPress={() => navigation.navigate('Appointments')}
          />
          <QuickAction
            icon={<Stethoscope color={tokens.colors.secondary.DEFAULT} size={24} />}
            label="Consult Now"
            onPress={() => { /* telemedicine deep-link */ }}
          />
          <QuickAction
            icon={<FileText color={tokens.colors.warning.DEFAULT} size={24} />}
            label="Lab Reports"
            onPress={() => navigation.navigate('Records')}
          />
          <QuickAction
            icon={<Pill color={tokens.colors.success.DEFAULT} size={24} />}
            label="Medications"
            onPress={() => navigation.navigate('Records')}
          />
        </View>

        {/* Upcoming Appointment */}
        <SectionHeader title="Upcoming Appointment" actionLabel="See All" onAction={() => navigation.navigate('Appointments')} />
        <View className="px-6 mb-6">
          {isLoading ? (
            <LoadingSkeleton height={120} borderRadius={16} />
          ) : (
            <MCard className="bg-indigo-600 border-0">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-indigo-100 font-medium mb-1">{upcomingAppointment.datetime}</Text>
                  <Text className="text-white text-lg font-bold">{upcomingAppointment.doctorName}</Text>
                  <Text className="text-indigo-200 text-sm">{upcomingAppointment.specialty} • {upcomingAppointment.type}</Text>
                </View>
                <View className="bg-white rounded-full p-2">
                  <Text className="text-lg">🎥</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between border-t border-indigo-500 pt-3 mt-1">
                <MBadge label={upcomingAppointment.status} variant="success" size="sm" />
                <TouchableOpacity>
                  <Text className="text-white font-medium text-sm">Reschedule</Text>
                </TouchableOpacity>
              </View>
            </MCard>
          )}
        </View>

        {/* Recent Health Records */}
        <SectionHeader title="Recent Records" actionLabel="See All" onAction={() => navigation.navigate('Records')} />
        <View className="px-6 mb-8 space-y-3">
          {isLoading ? (
            <>
              <LoadingSkeleton height={72} borderRadius={12} />
              <LoadingSkeleton height={72} borderRadius={12} className="mt-3" />
            </>
          ) : (
            recentRecords.map(record => (
              <RecordCard key={record.id} title={record.title} date={record.date} type={record.type} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity className="items-center w-[22%] mb-4" onPress={onPress}>
      <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-sm shadow-slate-200 elevation-1 mb-2">
        {icon}
      </View>
      <Text className="text-xs text-center text-slate-700 font-medium leading-tight">{label}</Text>
    </TouchableOpacity>
  );
}

interface RecordCardProps {
  title: string;
  date: string;
  type: string;
}

function RecordCard({ title, date, type }: RecordCardProps) {
  return (
    <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl shadow-sm shadow-slate-200 elevation-1 border border-slate-100 mb-3">
      <View className="w-12 h-12 bg-slate-50 rounded-lg items-center justify-center mr-4">
        <FileText color={tokens.colors.text.muted} size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900 mb-1">{title}</Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-slate-500 mr-2">{date}</Text>
          <View className="w-1 h-1 rounded-full bg-slate-300 mr-2" />
          <Text className="text-xs text-slate-500">{type}</Text>
        </View>
      </View>
      <Text className="text-slate-400">›</Text>
    </TouchableOpacity>
  );
}
