import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import TreeScreen from "./screens/TreeScreen";
import SubjectDetailScreen from "./screens/SubjectDetailScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#1e293b" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "700" },
          cardStyle: { backgroundColor: "#0f172a" },
        }}
      >
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
    </NavigationContainer>
  );
}