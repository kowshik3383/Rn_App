import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login/phone" options={{ headerShown: false }} />
        <Stack.Screen name="login/otp" options={{ headerShown: false }} />
        <Stack.Screen name="profile/create" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="glucose/glucose" options={{ headerShown: false }} />
        {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
