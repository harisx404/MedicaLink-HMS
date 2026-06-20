import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/AppHeader';
import { MSearchInput } from '../../components/MSearchInput';
import { FileText, Download, Share2 } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';

const MOCK_RECORDS = [
  { id: '1', title: 'Complete Blood Count', date: 'Oct 24, 2026', doctor: 'Dr. Sarah Jenkins', type: 'Lab Result' },
  { id: '2', title: 'Chest X-Ray Report', date: 'Oct 15, 2026', doctor: 'Dr. Michael Chen', type: 'Imaging' },
  { id: '3', title: 'Cardiology Consultation', date: 'Sep 10, 2026', doctor: 'Dr. Emily Ross', type: 'Prescription' },
];

export function MedicalRecords() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Medical Records" />
      
      <View className="p-4 bg-white border-b border-slate-200">
        <MSearchInput 
          placeholder="Search records..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </View>

      <FlatList
        data={MOCK_RECORDS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm shadow-slate-100 elevation-1">
            <View className="flex-row items-start mb-3">
              <View className="w-12 h-12 bg-indigo-50 rounded-lg items-center justify-center mr-4">
                <FileText color={tokens.colors.primary.DEFAULT} size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900 mb-1">{item.title}</Text>
                <Text className="text-slate-500 text-sm mb-1">{item.doctor}</Text>
                <View className="flex-row items-center">
                  <Text className="text-xs text-slate-400 mr-2">{item.date}</Text>
                  <View className="w-1 h-1 rounded-full bg-slate-300 mr-2" />
                  <Text className="text-xs text-indigo-600 font-medium">{item.type}</Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row justify-end pt-3 border-t border-slate-100 space-x-4">
              <TouchableOpacity className="flex-row items-center">
                <Share2 color={tokens.colors.text.muted} size={16} />
                <Text className="text-slate-500 font-medium text-sm ml-1">Share</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center ml-4">
                <Download color={tokens.colors.primary.DEFAULT} size={16} />
                <Text className="text-indigo-600 font-medium text-sm ml-1">Download</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
