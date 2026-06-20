import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { MSearchInput } from '../../components/MSearchInput';
import { MBadge } from '../../components/MBadge';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { WardStackParamList } from '../../navigation/types';
import { Activity } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';

type WardNavProp = StackNavigationProp<WardStackParamList, 'WardOverviewTab'>;

type PatientStatus = 'STABLE' | 'CRITICAL' | 'OBSERVATION';

interface WardPatient {
  id: string;
  name: string;
  bed: string;
  status: PatientStatus;
  lastVitals: string;
}

const MOCK_WARD_PATIENTS: WardPatient[] = [
  { id: '1', name: 'John Doe', bed: 'ICU-01', status: 'STABLE', lastVitals: '10 mins ago' },
  { id: '2', name: 'Alice Smith', bed: 'GEN-12', status: 'CRITICAL', lastVitals: '2 hours ago' },
  { id: '3', name: 'Bob Johnson', bed: 'GEN-14', status: 'OBSERVATION', lastVitals: '30 mins ago' },
];

const STATUS_VARIANT: Record<PatientStatus, 'success' | 'danger' | 'warning'> = {
  STABLE: 'success',
  CRITICAL: 'danger',
  OBSERVATION: 'warning',
};

export function WardOverview() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation<WardNavProp>();

  const filtered = MOCK_WARD_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.bed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Ward Overview" />

      <View className="p-4 bg-white border-b border-slate-200">
        <MSearchInput
          placeholder="Search patient or bed..."
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 rounded-xl border border-slate-200 mb-3 shadow-sm shadow-slate-100 elevation-1"
            onPress={() => navigation.navigate('VitalsEntry', { patientId: item.id, patientName: item.name })}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-lg font-bold text-slate-900">{item.name}</Text>
                <Text className="text-slate-500 font-medium">Bed: {item.bed}</Text>
              </View>
              <MBadge label={item.status} variant={STATUS_VARIANT[item.status]} size="sm" />
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
              <View className="flex-row items-center">
                <Activity color={tokens.colors.primary.DEFAULT} size={16} />
                <Text className="text-slate-500 text-xs ml-1">Vitals updated {item.lastVitals}</Text>
              </View>
              <Text className="text-indigo-600 font-medium text-sm">Add Vitals</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
