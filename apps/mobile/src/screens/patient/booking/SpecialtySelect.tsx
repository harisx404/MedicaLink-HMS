import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { MSearchInput } from '../../../components/MSearchInput';
import { useNavigation } from '@react-navigation/native';
import { Stethoscope, Heart, Eye, Brain } from 'lucide-react-native';
import { tokens } from '../../../lib/tokens';

const SPECIALTIES = [
  { id: '1', name: 'General Practice', icon: Stethoscope },
  { id: '2', name: 'Cardiology', icon: Heart },
  { id: '3', name: 'Ophthalmology', icon: Eye },
  { id: '4', name: 'Neurology', icon: Brain },
];

export function SpecialtySelect() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Select Specialty" showBack />
      
      <View className="p-4 bg-white border-b border-slate-200">
        <MSearchInput 
          placeholder="Search specialties..." 
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      <FlatList
        data={SPECIALTIES}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity 
              className="bg-white p-6 rounded-2xl items-center justify-center w-[48%] mb-4 border border-slate-200 shadow-sm shadow-slate-100 elevation-1"
              onPress={() => (navigation as any).navigate('DoctorSelect', { specialtyId: item.id, specialtyName: item.name })}
            >
              <View className="w-16 h-16 bg-indigo-50 rounded-full items-center justify-center mb-4">
                <Icon color={tokens.colors.primary.DEFAULT} size={32} />
              </View>
              <Text className="text-slate-900 font-medium text-center">{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
