import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import * as authService from "./src/services/auth";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import TreeScreen from "./screens/TreeScreen";
import SubjectDetailScreen from "./screens/SubjectDetailScreen";

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: "#1e293b" },
  headerTintColor: "#f8fafc",
  headerTitleStyle: { fontWeight: "700" },
  cardStyle: { backgroundColor: "#0f172a" },
};

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Tree"
        component={TreeScreen}
        options={{ title: "Prerequisite Tree" }}
      />
      <Stack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen}
        options={{ title: "Subject Detail" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has an existing session on app load
    async function checkSession() {
      try {
        const session = await authService.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Error checking session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}