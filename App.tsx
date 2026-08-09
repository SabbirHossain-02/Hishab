import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, List, PieChart, Target } from 'lucide-react-native';

import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PermissionScreen } from './src/screens/PermissionScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { BudgetsScreen } from './src/screens/BudgetsScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { MoneyStoryScreen } from './src/screens/MoneyStoryScreen';
import { setupDatabase } from './src/database';
import { useColorScheme } from 'react-native';
import { tokens } from './src/theme/tokens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const isDark = useColorScheme() === 'dark';
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? tokens.colors.tealNeutral[900] : '#fff',
          borderTopColor: isDark ? tokens.colors.tealNeutral[800] : tokens.colors.tealNeutral[100],
        },
        tabBarActiveTintColor: tokens.colors.gradient.primary[0],
        tabBarInactiveTintColor: tokens.colors.tealNeutral.textMutedLight,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ tabBarIcon: ({ color }) => <List color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ tabBarIcon: ({ color }) => <PieChart color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetsScreen} 
        options={{ tabBarIcon: ({ color }) => <Target color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await setupDatabase();
      } catch (e) {
        console.error("Database setup failed", e);
      } finally {
        setIsDbReady(true);
      }
    }
    init();
  }, []);

  if (!isDbReady) {
    return null; // Or a splash screen component
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
          primary: tokens.colors.gradient.primary[0],
          background: isDark ? tokens.colors.tealNeutral[900] : tokens.colors.tealNeutral[50],
          card: isDark ? tokens.colors.tealNeutral[800] : tokens.colors.tealNeutral[100],
          text: isDark ? tokens.colors.tealNeutral.textLight : tokens.colors.tealNeutral.textDark,
          border: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100],
          notification: tokens.colors.semantic.error,
        },
      }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Permissions" component={PermissionScreen} />
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen 
            name="MoneyStory" 
            component={MoneyStoryScreen} 
            options={{ presentation: 'fullScreenModal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
