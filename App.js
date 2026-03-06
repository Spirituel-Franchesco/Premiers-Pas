import "react-native-gesture-handler";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AdminStepsScreen from "./src/screens/AdminStepsScreen";
import TransportScreen from "./src/screens/TransportScreen";
import ClimateScreen from "./src/screens/ClimateScreen";
import HealthScreen from './src/screens/HealthScreen';

import { clearAll } from "./src/services/storageService";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AdminSteps" component={AdminStepsScreen} />
        <Stack.Screen name="Transport" component={TransportScreen} />
        <Stack.Screen name="Climate" component={ClimateScreen} />
        <Stack.Screen name="Health" component={HealthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
