import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import CalendarDashboard from '@/components/CalendarDashboard';

export default function HomeScreen() {
  const router = useRouter();


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          // navigate to splash if no token
          router.replace('/splash');
        }
      } catch (error) {
        console.error('Error checking authToken:', error);
        router.replace('/splash');
      }
    };

    checkAuth();
  }, );

  return (
    <View style={styles.container}>
      <CalendarDashboard />
  
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
