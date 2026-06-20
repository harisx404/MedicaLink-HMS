import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNetworkListener } from '../hooks/useNetworkListener';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { tokens } from '../lib/tokens';

import type { RootStackParamList } from './types';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { TenantEntryScreen } from '../screens/auth/TenantEntryScreen';
import { TwoFactorScreen } from '../screens/auth/TwoFactorScreen';

// Role Navigators
import { PatientNavigator } from './PatientNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { NurseNavigator } from './NurseNavigator';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();
const Stack = createStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#ffffff" size="large" />
    </View>
  );
}

export function AppNavigator() {
  const { user, isLoading, restoreSession } = useAuthStore();

  useNetworkListener();
  usePushNotifications();

  useEffect(() => {
    restoreSession().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  // Show branded loading screen instead of null (prevents white flash)
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                  <>
                    <Stack.Screen name="TenantEntry" component={TenantEntryScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
                  </>
                ) : (
                  <>
                    {user.role === 'PATIENT' && <Stack.Screen name="PatientApp" component={PatientNavigator} />}
                    {user.role === 'DOCTOR' && <Stack.Screen name="DoctorApp" component={DoctorNavigator} />}
                    {user.role === 'NURSE' && <Stack.Screen name="NurseApp" component={NurseNavigator} />}
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
