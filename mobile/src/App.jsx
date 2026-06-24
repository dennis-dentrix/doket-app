import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import useSettingsStore from './store/settingsStore';
import { initDatabase } from './services/sqlite';
import { colors } from './utils/theme';
import DoketLogo from './components/DoketLogo';

import WelcomeScreen from './screens/WelcomeScreen';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateInvoiceScreen from './screens/CreateInvoiceScreen';
import InvoicePreviewScreen from './screens/InvoicePreviewScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReceiptScannerScreen from './screens/ReceiptScannerScreen';
import ReceiptDetailScreen from './screens/ReceiptDetailScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Create: { focused: 'add-circle', unfocused: 'add-circle-outline' },
  Receipts: { focused: 'receipt', unfocused: 'receipt-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

function TabIcon({ label, focused, color }) {
  const icons = TAB_ICONS[label];
  return (
    <View style={tabStyles.iconContainer}>
      <Ionicons name={focused ? icons.focused : icons.unfocused} size={24} color={color} />
      {focused && <View style={tabStyles.indicator} />}
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => <TabIcon label={route.name} focused={focused} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Create" component={CreateInvoiceScreen} />
      <Tab.Screen name="Receipts" component={ReceiptsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} />
      <Stack.Screen
        name="ReceiptScanner"
        component={ReceiptScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { user, isInitialized, initialize } = useAuthStore();
  const { loadTheme, handleSystemChange } = useThemeStore();
  const { loadSettings } = useSettingsStore();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    // Listen for OS-level appearance changes
    const sub = Appearance.addChangeListener(() => handleSystemChange());
    return () => sub.remove();
  }, []);

  useEffect(() => {
    async function setup() {
      await Promise.all([loadTheme(), loadSettings()]);
      await initDatabase();
      await initialize();
    }
    setup();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.loading}>
        <DoketLogo size={72} />
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#004E89' },
});

const tabStyles = StyleSheet.create({
  iconContainer: { alignItems: 'center' },
  indicator: {
    position: 'absolute', top: -6, width: 4, height: 4,
    backgroundColor: colors.primary, borderRadius: 2,
  },
});
