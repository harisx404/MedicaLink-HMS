import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { Avatar } from '../../components/Avatar';
import { MCard } from '../../components/MCard';
import { SectionHeader } from '../../components/SectionHeader';
import { FileText, Activity } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { DoctorPatientStackParamList } from '../../navigation/types';
import type { LucideIcon } from 'lucide-react-native';

type PatientDetailRouteProp = RouteProp<DoctorPatientStackParamList, 'PatientDetail'>;

interface VitalCardProps {
  label: string;
  value: string;
  unit: string;
}

interface HistoryItemProps {
  title: string;
  date: string;
  doctor: string;
  icon: LucideIcon;
}

export function PatientDetailMobile() {
  const route = useRoute<PatientDetailRouteProp>();
  const { patientName } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Patient Details" showBack rightElement={
        <TouchableOpacity>
          <Text className="text-indigo-600 font-bold">Edit</Text>
        </TouchableOpacity>
      } />

      <ScrollView className="flex-1">
        <View className="bg-white p-6 border-b border-slate-200 items-center">
          <Avatar name={patientName} size={80} className="mb-4" />
          <Text className="text-2xl font-bold text-slate-900 mb-1">{patientName}</Text>
          <Text className="text-slate-500 mb-4">45 yrs • Male • ID: PT-10024</Text>

          <View className="flex-row space-x-2">
            <View className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <Text className="text-indigo-700 font-medium text-xs">Hypertension</Text>
            </View>
            <View className="bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <Text className="text-amber-700 font-medium text-xs">Allergic to Penicillin</Text>
            </View>
          </View>
        </View>

        <View className="pt-6">
          <SectionHeader title="Recent Vitals" actionLabel="Add New" onAction={() => { /* navigate to vitals */ }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 pb-6">
            <VitalCard label="Blood Pressure" value="120/80" unit="mmHg" />
            <VitalCard label="Heart Rate" value="72" unit="bpm" />
            <VitalCard label="Temperature" value="98.6" unit="°F" />
            <VitalCard label="Weight" value="175" unit="lbs" />
          </ScrollView>

          <SectionHeader title="Medical History" />
          <View className="px-6 space-y-4 mb-8">
            <HistoryItem title="Cardiology Follow-up" date="Oct 20, 2026" doctor="Dr. Sarah Jenkins" icon={Activity} />
            <HistoryItem title="Annual Physical Checkup" date="May 14, 2026" doctor="Dr. Michael Chen" icon={FileText} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VitalCard({ label, value, unit }: VitalCardProps) {
  return (
    <MCard className="w-32 mr-4 border border-slate-200 shadow-sm shadow-slate-100 elevation-1">
      <Text className="text-slate-500 text-xs font-medium mb-2">{label}</Text>
      <Text className="text-2xl font-bold text-slate-900 mb-1">{value}</Text>
      <Text className="text-slate-400 text-xs font-medium">{unit}</Text>
    </MCard>
  );
}

function HistoryItem({ title, date, doctor, icon: Icon }: HistoryItemProps) {
  return (
    <MCard className="flex-row items-center border border-slate-200 shadow-sm shadow-slate-100 elevation-1">
      <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-4">
        <Icon color={tokens.colors.primary.DEFAULT} size={20} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-slate-900 mb-1">{title}</Text>
        <Text className="text-slate-500 text-xs">{doctor} • {date}</Text>
      </View>
    </MCard>
  );
}
