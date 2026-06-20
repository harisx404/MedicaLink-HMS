import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import * as SecureStore from 'expo-secure-store';

export function TwoFactorScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { setAccessToken } = useAuthStore();
  
  const userId = (route.params as any)?.userId;

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-2fa', { userId, totpCode: code });
      const { accessToken, refreshToken, user } = response.data.data;
      
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }
      
      setAccessToken(accessToken);
      useAuthStore.setState({ user, isLoading: false });
      // AppNavigator will redirect
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid 2FA code');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">🔒</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900">Two-Factor Auth</Text>
          <Text className="text-slate-500 mt-2 text-center">Enter the 6-digit code from your authenticator app.</Text>
        </View>

        <View className="space-y-4">
          <TextInput
            className="w-full h-14 bg-white border border-slate-200 rounded-xl px-4 text-center text-2xl tracking-widest font-mono text-slate-900"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            className="w-full h-12 bg-indigo-600 rounded-xl items-center justify-center mt-6"
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-full h-12 items-center justify-center mt-2"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-slate-500 font-medium text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
