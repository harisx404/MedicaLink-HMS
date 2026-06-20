import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { VitalInput } from '../../components/VitalInput';
import { MButton } from '../../components/MButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { WardStackParamList } from '../../navigation/types';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';

type VitalsEntryRouteProp = RouteProp<WardStackParamList, 'VitalsEntry'>;
type VitalsEntryNavProp = StackNavigationProp<WardStackParamList, 'VitalsEntry'>;

interface VitalsPayload {
  patientId: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
}

async function submitVitals(payload: VitalsPayload): Promise<void> {
  await api.post(`/patients/${payload.patientId}/vitals`, payload);
}

export function VitalsEntry() {
  const route = useRoute<VitalsEntryRouteProp>();
  const navigation = useNavigation<VitalsEntryNavProp>();
  const { patientId, patientName } = route.params;

  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [rr, setRr] = useState('');
  const [spo2, setSpo2] = useState('');

  const mutation = useMutation({
    mutationFn: submitVitals,
    onSuccess: () => {
      Alert.alert('Success', 'Vitals have been recorded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save vitals. Please try again.');
    },
  });

  const handleSave = () => {
    if (!bp && !hr && !temp && !rr && !spo2) {
      Alert.alert('Validation', 'Please enter at least one vital sign.');
      return;
    }
    mutation.mutate({
      patientId,
      bloodPressure: bp,
      heartRate: hr,
      temperature: temp,
      respiratoryRate: rr,
      spo2,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Record Vitals" showBack />

      <View className="px-6 py-6 bg-white border-b border-slate-200 mb-6">
        <Text className="text-sm text-slate-500 mb-1">Patient</Text>
        <Text className="text-xl font-bold text-slate-900">{patientName}</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <VitalInput
          label="Blood Pressure"
          unit="mmHg"
          placeholder="e.g. 120/80"
          value={bp}
          onChangeText={setBp}
        />
        <VitalInput
          label="Heart Rate"
          unit="bpm"
          placeholder="e.g. 72"
          value={hr}
          onChangeText={setHr}
          keyboardType="numeric"
        />
        <VitalInput
          label="Temperature"
          unit="°F"
          placeholder="e.g. 98.6"
          value={temp}
          onChangeText={setTemp}
          keyboardType="decimal-pad"
        />
        <VitalInput
          label="Respiratory Rate"
          unit="breaths/min"
          placeholder="e.g. 16"
          value={rr}
          onChangeText={setRr}
          keyboardType="numeric"
        />
        <VitalInput
          label="SpO2"
          unit="%"
          placeholder="e.g. 98"
          value={spo2}
          onChangeText={setSpo2}
          keyboardType="numeric"
        />
      </ScrollView>

      <View className="p-6 bg-white border-t border-slate-200">
        <MButton
          label="Save Vitals"
          onPress={handleSave}
          isLoading={mutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
