import 'react-native-gesture-handler';
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';

// Polyfill for NativeWind/Reanimated issues in some environments
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Constants.platform.ios.model has been deprecated']);

export default function App() {
  return <AppNavigator />;
}
