import "react-native-gesture-handler";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

import { clearAll } from "./src/services/storageService";

const Stack = createStackNavigator();

function HomePlaceholder() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home - À venir ✅</Text>
      <TouchableOpacity
        onPress={async () => {
          await clearAll();
          alert("Données effacées !");
        }}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#E63946",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>🗑️ Reset Onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomePlaceholder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
