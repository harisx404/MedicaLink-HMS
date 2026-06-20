import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';

export function TenantEntryScreen() {
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setTenantSlug, tenantSlug } = useAuthStore();
  const navigation = useNavigation();

  useEffect(() => {
    // If slug is already set in secure store from a previous session, skip this screen
    if (tenantSlug) {
      (navigation as any).replace('Login');
    }
  }, [tenantSlug]);

  const handleNext = async () => {
    if (!slug) {
      Alert.alert('Error', 'Please enter a hospital ID');
      return;
    }

    setIsLoading(true);
    try {
      // Verify tenant slug exists by calling a health or public endpoint
      // For now, we assume success or you can implement a GET /tenant/:slug endpoint
      await setTenantSlug(slug);
      (navigation as any).replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Invalid hospital ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-indigo-100 rounded-2xl items-center justify-center mb-4 border border-indigo-200">
            <Text className="text-indigo-600 text-3xl font-bold">🏥</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 text-center">Welcome to MedicaLink</Text>
          <Text className="text-slate-500 mt-2 text-center">Enter your hospital ID to continue</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1">Hospital ID (Tenant Slug)</Text>
            <TextInput
              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-slate-900"
              placeholder="e.g. cityhospital"
              autoCapitalize="none"
              autoCorrect={false}
              value={slug}
              onChangeText={setSlug}
            />
          </View>

          <TouchableOpacity
            className="w-full h-12 bg-indigo-600 rounded-xl items-center justify-center mt-6"
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
