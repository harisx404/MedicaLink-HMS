import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { MSearchInput } from '../../components/MSearchInput';
import { Avatar } from '../../components/Avatar';
import { useNavigation } from '@react-navigation/native';

const MOCK_PATIENTS = [
  { id: '1', name: 'John Doe', age: 45, gender: 'Male', lastVisit: '2 days ago' },
  { id: '2', name: 'Alice Smith', age: 32, gender: 'Female', lastVisit: '1 week ago' },
  { id: '3', name: 'Bob Johnson', age: 58, gender: 'Male', lastVisit: '1 month ago' },
];

export function PatientsList() {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="My Patients" />
      
      <View className="p-4 bg-white border-b border-slate-200">
        <MSearchInput 
          placeholder="Search by name or ID..." 
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      <FlatList
        data={MOCK_PATIENTS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="flex-row items-center bg-white p-4 rounded-xl border border-slate-200 mb-3 shadow-sm shadow-slate-100 elevation-1"
            onPress={() => (navigation as any).navigate('PatientDetail', { patientId: item.id, patientName: item.name })}
          >
            <Avatar name={item.name} size={56} className="mr-4" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 mb-1">{item.name}</Text>
              <Text className="text-slate-500 text-sm">{item.age} yrs • {item.gender}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-slate-400 mb-1">Last Visit</Text>
              <Text className="text-sm font-medium text-slate-700">{item.lastVisit}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
