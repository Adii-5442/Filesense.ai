/**
 * FileSense.AI - Main App Component
 * AI-powered file organization made simple
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar 
        backgroundColor={Colors.background} 
        barStyle="dark-content" 
        translucent={false}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
