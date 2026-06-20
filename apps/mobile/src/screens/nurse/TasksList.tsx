import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { MBadge } from '../../components/MBadge';
import { Pill, Activity, Syringe } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';

const MOCK_TASKS = [
  { id: '1', patient: 'Alice Smith', bed: 'GEN-12', action: 'Administer IV Antibiotics', time: '10:00 AM', type: 'MEDICATION', status: 'PENDING' },
  { id: '2', patient: 'John Doe', bed: 'ICU-01', action: 'Check Blood Pressure', time: '10:30 AM', type: 'VITALS', status: 'PENDING' },
  { id: '3', patient: 'Bob Johnson', bed: 'GEN-14', action: 'Draw Blood Sample', time: '11:00 AM', type: 'PROCEDURE', status: 'COMPLETED' },
];

export function TasksList() {
  const [filter, setFilter] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  const filtered = MOCK_TASKS.filter(t => t.status === filter);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="My Tasks" />
      
      <View className="flex-row p-4 bg-white border-b border-slate-200">
        <TouchableOpacity 
          className={`flex-1 py-2 items-center border-b-2 ${filter === 'PENDING' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('PENDING')}
        >
          <Text className={`font-bold ${filter === 'PENDING' ? 'text-indigo-600' : 'text-slate-500'}`}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-2 items-center border-b-2 ${filter === 'COMPLETED' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('COMPLETED')}
        >
          <Text className={`font-bold ${filter === 'COMPLETED' ? 'text-indigo-600' : 'text-slate-500'}`}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          let Icon = Pill;
          if (item.type === 'VITALS') Icon = Activity;
          if (item.type === 'PROCEDURE') Icon = Syringe;

          return (
            <TouchableOpacity className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm shadow-slate-100 elevation-1">
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-indigo-50 rounded-lg items-center justify-center mr-4">
                  <Icon color={tokens.colors.primary.DEFAULT} size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-slate-900 mb-1">{item.action}</Text>
                  <Text className="text-slate-500 font-medium mb-1">{item.patient} • {item.bed}</Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-sm font-bold text-indigo-600">{item.time}</Text>
                    {filter === 'PENDING' && (
                      <TouchableOpacity className="bg-indigo-600 px-4 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">Mark Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
