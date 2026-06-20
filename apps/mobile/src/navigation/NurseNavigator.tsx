import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LayoutDashboard, CheckSquare, User } from 'lucide-react-native';
import { tokens } from '../lib/tokens';

import type { NurseTabParamList, WardStackParamList } from './types';

import { WardOverview } from '../screens/nurse/WardOverview';
import { TasksList } from '../screens/nurse/TasksList';
import { VitalsEntry } from '../screens/nurse/VitalsEntry';
import { NurseProfile } from '../screens/nurse/NurseProfile';

const Tab = createBottomTabNavigator<NurseTabParamList>();
const WardStack = createStackNavigator<WardStackParamList>();

function WardStackNavigator() {
  return (
    <WardStack.Navigator screenOptions={{ headerShown: false }}>
      <WardStack.Screen name="WardOverviewTab" component={WardOverview} />
      <WardStack.Screen name="VitalsEntry" component={VitalsEntry} />
    </WardStack.Navigator>
  );
}

export function NurseNavigator() {
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
        name="Ward"
        component={WardStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksList}
        options={{
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={NurseProfile}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
