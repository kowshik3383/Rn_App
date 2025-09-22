import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FoodIcon from '../assets/logo1.svg';
import ActivityIcon from '../assets/logo2.svg';
import LearnIcon from '../assets/logo3.svg';
import GlucoseIcon from '../assets/logo4.svg'; 
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import GlucoseLogs from './ui/GlucoseLogs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CalendarDashboard = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold
  });

  const weekDays = [
    new Date(2025, 8, 19),
    new Date(2025, 8, 20),
    new Date(2025, 8, 21),
    new Date(2025, 8, 22),
    new Date(2025, 8, 23),
    new Date(2025, 8, 24),
    new Date(2025, 8, 25),
    new Date(2025, 8, 26),
  ];

  const categories = [{ id: 1, title: 'Food', IconComponent: FoodIcon, backgroundColor: '#E8F4FD', link: '/food' }, { id: 2, title: 'Activity', IconComponent: ActivityIcon, backgroundColor: '#E8F4FD', link: '/activity' }, { id: 3, title: 'Learning', IconComponent: LearnIcon, backgroundColor: '#E8F4FD', link: '/splash' }, { id: 4, title: 'Glucose', IconComponent: GlucoseIcon, backgroundColor: '#F3E5F5', link: '/glucose' },];
  const handleTodayPress = () => setSelectedDate(today);
  const handleDatePress = (date: Date) => setSelectedDate(date);
  const handleCategoryPress = (category: { id: number; link: string }) => {
    setActiveCategory(category.id);
    router.push(category.link);
  };

  const headerDateText = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken'); // clear token
      router.replace('/splash'); // navigate to splash
    } catch (error) {
      console.error('Error clearing authToken:', error);
    }
  };

  const ListHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthContainer}>
          <MaterialIcons name="keyboard-arrow-left" size={24} color="#666" />
          <Text style={styles.monthText}>{headerDateText}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#666" />
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
          <Text style={styles.todayButtonText}>Go to Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <FlatList
        horizontal
        data={weekDays}
        keyExtractor={(d) => d.toDateString()}
        renderItem={({ item }) => {
          const isSelected = item.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              style={[styles.dayContainer, isSelected && styles.selectedDayContainer]}
              onPress={() => handleDatePress(item)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {item.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {item.getDate()}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContent}
      />
  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
    <MaterialIcons name="logout" size={22} color="white" />
  </TouchableOpacity>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const SvgIcon = category.IconComponent;
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: isActive ? '#2196F3' : category.backgroundColor }]}
              onPress={() => handleCategoryPress(category)}
            >
              <SvgIcon width={28} height={28} />
              <Text style={[styles.categoryTitle, isActive && { color: 'white' }]}>{category.title}</Text>
            </TouchableOpacity>
          );
        })}

      </View>
<GlucoseLogs/>

    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#E3F2FD' }}>
      <FlatList
        data={[]} 
        renderItem={null}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={<ListHeader />}
      />
   <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/glucose/glucose')}>
          <MaterialIcons name="add" size={24} color="blue" />
          <Text style={styles.floatingButtonText}>Log Glucose</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 60, paddingHorizontal: 8 },
  monthContainer: { flexDirection: 'row', alignItems: 'center' },
  monthText: { fontSize: 16, fontFamily: "Urbanist_700Bold", color: '#333', marginHorizontal: 4 },
  todayButton: { backgroundColor: '#E3F2FD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2196F3' },
  todayButtonText: { color: '#2196F3', fontSize: 14, fontFamily: "Urbanist_700Bold" },
  profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#37474F', justifyContent: 'center', alignItems: 'center' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 20 },
  categoryCard: { width: '23%', alignItems: 'center', paddingVertical: 12, borderRadius: 16, marginBottom: 12 },
  categoryTitle: { fontSize: 14, fontFamily: "Urbanist_700Bold", color: '#333', textAlign: 'center', marginTop: 8 },
  calendarContent: { paddingVertical: 10 },
  dayContainer: { alignItems: 'center', paddingVertical: 12, height: 80, paddingHorizontal: 16, marginHorizontal: 4, borderRadius: 25, minWidth: 60 },
  selectedDayContainer: { backgroundColor: '#2196F3' },
  dayText: { fontSize: 14, color: '#666', marginBottom: 4, fontFamily: "Urbanist_700Bold" },
  selectedDayText: { color: 'white' },
  dateText: { fontSize: 18, color: '#0d0a0aff', fontFamily: "Urbanist_700Bold" },
  selectedDateText: { color: 'white' },
  logItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  logContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  glucoseIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4757', marginRight: 12 },
  logDetails: { flex: 1 },
  glucoseValue: { fontSize: 18, fontFamily: "Urbanist_700Bold", color: '#333', marginBottom: 4 },
  contextTime: { fontSize: 14, color: '#666', fontFamily: "Urbanist_500Medium" },
  moreButton: { padding: 8, marginLeft: 8 },
  moreButtonText: { fontSize: 20, color: '#999', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Urbanist_700Bold", color: '#333', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  floatingButtonContainer: { position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  floatingButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  floatingButtonText: { color: 'blue', fontSize: 16, fontFamily: 'Urbanist_700Bold', marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});

export default CalendarDashboard;
