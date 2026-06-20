import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Calendar, Users, User } from 'lucide-react-native';
import { tokens } from '../lib/tokens';

import type { DoctorTabParamList, DoctorPatientStackParamList } from './types';

import { TodayScreen } from '../screens/doctor/TodayScreen';
import { PatientsList } from '../screens/doctor/PatientsList';
import { DoctorProfile } from '../screens/doctor/DoctorProfile';
import { PatientDetailMobile } from '../screens/doctor/PatientDetailMobile';

const Tab = createBottomTabNavigator<DoctorTabParamList>();
const PatientStack = createStackNavigator<DoctorPatientStackParamList>();

function PatientStackNavigator() {
  return (
    <PatientStack.Navigator screenOptions={{ headerShown: false }}>
      <PatientStack.Screen name="PatientsListTab" component={PatientsList} />
      <PatientStack.Screen name="PatientDetail" component={PatientDetailMobile} />
    </PatientStack.Navigator>
  );
}

export function DoctorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.primary.DEFAULT,
        tabBarInactiveTintColor: tokens.colors.text.muted,
        tabBarStyle: {
          backgroundColor: tokens.colors.bg.card,
          borderTopColor: tokens.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DoctorProfile}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
