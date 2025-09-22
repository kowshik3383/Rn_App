import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import { useGlucoseStore } from '@/store/glucoseStore';
import { useFocusEffect } from '@react-navigation/native'; // <--- new import

const GlucoseLogs = () => {
  const [fontsLoaded] = useFonts({ Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold });
  const logs = useGlucoseStore((state) => state.logs);
  const setLogs = useGlucoseStore((state) => state.setLogs);
  const removeLogFromStore = useGlucoseStore((state) => state.removeLog);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  };

  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('https://backend-rnapp.onrender.com/glucose', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch logs');

      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const deleteLog = async (logId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`https://backend-rnapp.onrender.com/glucose/${logId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) removeLogFromStore(logId);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (logId) => {
    Alert.alert('Delete Log', 'Are you sure you want to delete this glucose log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLog(logId) },
    ]);
  };

  // Fetch logs **every time the screen comes into focus**
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  if (!fontsLoaded || loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const renderLogItem = ({ item }) => {
    const { time, date } = formatDateTime(item.takenAt);
    return (
      <View style={styles.logItem}>
        <View style={styles.logContent}>
          <View style={styles.glucoseIndicator} />
          <View style={styles.logDetails}>
            <Text style={styles.glucoseValue}>{item.value} mg/dL</Text>
            <Text style={styles.contextTime}>{item.context} {time}, {date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}><Text style={styles.emptyIcon}>📊</Text></View>
      <Text style={styles.emptyTitle}>No glucose logs yet</Text>
      <Text style={styles.emptySubtitle}>Start tracking your glucose levels to see your logs here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs</Text>
      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Urbanist_700Bold", // medium Urbanist
    color: '#333',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  glucoseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4757',
    marginRight: 12,
  },
  logDetails: {
    flex: 1,
  },
  glucoseValue: {
    fontSize: 18,
    fontFamily: "Urbanist_700Bold", 
    color: '#333',
    marginBottom: 4,
  },
  contextTime: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Urbanist_500Medium", 

  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Urbanist_700Bold", 
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: "Urbanist_500Medium", // medium Urbanist

  },
});

export default GlucoseLogs;