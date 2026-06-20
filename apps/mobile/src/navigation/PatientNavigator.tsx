import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { Home, Calendar, FileText, User } from 'lucide-react-native';
import { tokens } from '../lib/tokens';

import type { PatientTabParamList, HomeStackParamList, AppointmentsStackParamList } from './types';

import { PatientHome } from '../screens/patient/PatientHome';
import { AppointmentList } from '../screens/patient/AppointmentList';
import { MedicalRecords } from '../screens/patient/MedicalRecords';
import { PatientProfile } from '../screens/patient/PatientProfile';
// Booking Flow
import { SpecialtySelect } from '../screens/patient/booking/SpecialtySelect';
import { DoctorSelect } from '../screens/patient/booking/DoctorSelect';
import { DateSelect } from '../screens/patient/booking/DateSelect';
import { SlotSelect } from '../screens/patient/booking/SlotSelect';
import { ConfirmBooking } from '../screens/patient/booking/ConfirmBooking';
import { BookingSuccess } from '../screens/patient/booking/BookingSuccess';

const Tab = createBottomTabNavigator<PatientTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const AppointmentsStack = createStackNavigator<AppointmentsStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="PatientHomeTab" component={PatientHome} />
    </HomeStack.Navigator>
  );
}

function AppointmentsStackNavigator() {
  return (
    <AppointmentsStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentsStack.Screen name="AppointmentListTab" component={AppointmentList} />
      <AppointmentsStack.Screen name="SpecialtySelect" component={SpecialtySelect} />
      <AppointmentsStack.Screen name="DoctorSelect" component={DoctorSelect} />
      <AppointmentsStack.Screen name="DateSelect" component={DateSelect} />
      <AppointmentsStack.Screen name="SlotSelect" component={SlotSelect} />
      <AppointmentsStack.Screen name="ConfirmBooking" component={ConfirmBooking} />
      <AppointmentsStack.Screen name="BookingSuccess" component={BookingSuccess} />
    </AppointmentsStack.Navigator>
  );
}

export function PatientNavigator() {
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
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Records"
        component={MedicalRecords}
        options={{
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PatientProfile}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
