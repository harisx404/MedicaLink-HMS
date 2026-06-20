import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';
import axios from 'axios';

type LoginNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigation = useNavigation<LoginNavProp>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login({ email, password });
      // On success, AppNavigator automatically switches to the role-based navigator
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message: string = error.response?.data?.message ?? 'Login failed. Please try again.';

        // If the backend requests 2FA, navigate to that screen
        if (message.includes('2FA')) {
          const userId: string = error.response?.data?.data?.userId ?? '';
          navigation.navigate('TwoFactor', { userId });
          return;
        }

        Alert.alert('Login Failed', message);
      } else {
        Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-indigo-600 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">ML</Text>
          </View>
          <Text className="text-3xl font-bold text-slate-900">MedicaLink</Text>
          <Text className="text-slate-500 mt-2">Sign in to your account</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1">Email Address</Text>
            <TextInput
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1">Password</Text>
            <TextInput
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity className="self-end mt-2">
            <Text className="text-indigo-600 font-medium text-sm">Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-12 bg-indigo-600 rounded-xl items-center justify-center mt-6"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
