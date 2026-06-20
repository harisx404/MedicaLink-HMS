import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/Avatar';
import { MButton } from '../../components/MButton';
import { ChevronRight, User, Settings, Shield, LogOut } from 'lucide-react-native';
import { tokens } from '../../lib/tokens';

export function NurseProfile() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="items-center py-8 bg-white border-b border-slate-200">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={80} className="mb-4" />
          <Text className="text-2xl font-bold text-slate-900">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-slate-500 mt-1">{user?.email}</Text>
          <View className="mt-4 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100">
            <Text className="text-teal-700 font-medium">Head Nurse • ICU</Text>
          </View>
        </View>

        <View className="mt-6 px-4">
          <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-100 elevation-1">
            <ProfileOption icon={<User size={20} color={tokens.colors.primary.DEFAULT} />} title="Personal Information" />
            <ProfileOption icon={<Shield size={20} color={tokens.colors.primary.DEFAULT} />} title="Security & 2FA" />
            <ProfileOption icon={<Settings size={20} color={tokens.colors.primary.DEFAULT} />} title="Preferences" isLast />
          </View>

          <MButton 
            label="Log Out" 
            variant="danger" 
            className="mt-6 mb-8"
            leftIcon={<LogOut size={20} color="white" />}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileOption({ icon, title, isLast = false, onPress }: { icon: React.ReactNode, title: string, isLast?: boolean, onPress?: () => void }) {
  return (
    <TouchableOpacity 
      className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-100' : ''}`}
      onPress={onPress}
    >
      <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mr-4">
        {icon}
      </View>
      <Text className="flex-1 text-base font-medium text-slate-900">{title}</Text>
      <ChevronRight size={20} color={tokens.colors.text.muted} />
    </TouchableOpacity>
  );
}
