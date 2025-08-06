import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  HomeScreen,
  AuthScreen,
  OtpVerificationScreen,
  ProfileSetupScreen,
  FileSelectorScreen,
  ProcessingScreen,
  ResultsScreen,
  SettingsScreen,
} from '../screens';
import { NavigationParams } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createStackNavigator<NavigationParams>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated || isGuest ? "Home" : "Auth"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
          animationEnabled: true,
          gestureEnabled: true,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="OtpVerification" 
          component={OtpVerificationScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        
        {/* Main App Screens */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="FileSelector" 
          component={FileSelectorScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="Processing" 
          component={ProcessingScreen}
          options={{
            gestureEnabled: false, // Prevent back gesture during processing
          }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{
            gestureEnabled: false, // Prevent back gesture from results
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};