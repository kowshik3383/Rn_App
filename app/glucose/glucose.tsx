import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import FastingImg from "../../assets/glucose1.png";
import MealImg from '../../assets/glucose2.png';
import MealImg2 from '../../assets/glucose4.png';
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
import { useGlucoseStore } from "@/store/glucoseStore";
import { useRouter } from "expo-router";
import SuccessModal from "@/components/ui/SuccessModal";
// SVG Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FastingIcon = () => (
  <Image source={FastingImg} style={{ width: 44, height: 44 }} />

);

const MealIcon = () => <Image source={MealImg} style={{ width: 44, height: 44 }} />;

const LunchIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#32CD32" strokeWidth="2" fill="#F0FFF0" />
    <Rect x="8" y="9" width="8" height="6" rx="1" stroke="#32CD32" strokeWidth="1.5" fill="none" />
    <Path d="M10 11H14M10 13H14" stroke="#32CD32" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const DinnerIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#8A2BE2" strokeWidth="2" fill="#F8F0FF" />
    <Path
      d="M8 12C8 12 10 14 12 14S16 12 16 12"
      stroke="#8A2BE2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 8V11"
      stroke="#8A2BE2"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const BreakfastIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#FF6B6B" strokeWidth="2" fill="#FFF0F0" />
    <Circle cx="12" cy="10" r="3" stroke="#FF6B6B" strokeWidth="1.5" fill="none" />
    <Path
      d="M12 13V15"
      stroke="#FF6B6B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const RandomIcon = () => (
  <Image source={MealImg2} style={{ width: 44, height: 44 }} />
);

const ClockIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#4A90E2" strokeWidth="2" />
    <Path
      d="M12 6V12L16 14"
      stroke="#4A90E2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
type GlucoseLogFormProps = {
  onLogSaved?: () => void; // optional callback with no arguments
};

const GlucoseLogForm: React.FC<GlucoseLogFormProps> = ({ onLogSaved }) => {
  const [value, setValue] = useState("168");
  const [selectedContext, setSelectedContext] = useState("");
  const [takenAt, setTakenAt] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [expandedOption, setExpandedOption] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(0.6); // Default position for 168
  const router = useRouter(); 
const [successVisible, setSuccessVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold
  });

  const contextOptions = [
    {
      id: "fasting",
      label: "Fasting",
      description: "Reading taken after an overnight fast",
      icon: FastingIcon
    },
    {
      id: "before_meal",
      label: "Before meal",
      description: "Reading taken within 5 minutes before a major meal",
      icon: MealIcon,
      hasSubOptions: true,
      subOptions: [
        { id: "before_breakfast", label: "Before breakfast", icon: BreakfastIcon },
        { id: "before_lunch", label: "Before lunch", icon: LunchIcon },
        { id: "before_dinner", label: "Before dinner", icon: DinnerIcon },
      ]
    },
    {
      id: "after_meal",
      label: "After meal",
      description: "Reading taken 2 hours 1-5 minutes after a major meal",
      icon: MealIcon,
      hasSubOptions: true,
      subOptions: [
        { id: "after_breakfast", label: "After breakfast", icon: BreakfastIcon },
        { id: "after_lunch", label: "After lunch", icon: LunchIcon },
        { id: "after_dinner", label: "After dinner", icon: DinnerIcon },
      ]
    },
    {
      id: "random",
      label: "Random",
      description: "Reading taken without feeling to any of these types",
      icon: RandomIcon
    },
  ];

  const addLogToStore = useGlucoseStore((state) => state.addLog);

  const handleSave = async () => {
    if (!value || !selectedContext || !takenAt) return; // Add takenAt check

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const res = await axios.post(
        'https://backend-rnapp.onrender.com/glucose',
        {
          value: Number(value),
          context: selectedContext,
          takenAt: takenAt ? takenAt.toISOString() : new Date().toISOString() // Safe fallback
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newLog = res.data;
      if (newLog && newLog.id) { // Ensure the response has required properties
        addLogToStore(newLog);
      }

      // reset form
      setValue("168");
      setSelectedContext("");
      setTakenAt(new Date());

      // Call the callback if provided
      if (onLogSaved) {
        onLogSaved();
      }
      setSuccessVisible(true);

    } catch (err) {
      console.error('Error saving glucose log:', err);
      Alert.alert('Error', 'Failed to save glucose reading. Please try again.');
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;


  const handleSliderMove = (event: { nativeEvent: { locationX: any; }; }) => {
    const { locationX } = event.nativeEvent;
    const sliderWidth = 200; // Total slider width
    const minValue = 50;
    const maxValue = 300;

    // Calculate position percentage (0-1)
    const position = Math.max(0, Math.min(1, locationX / sliderWidth));

    // Convert to glucose value
    const glucoseValue = Math.round(minValue + (position * (maxValue - minValue)));
    setValue(String(glucoseValue));
    setSliderPosition(position);
  };

  const handleOptionPress = (option: { id: string; label: string; description: string; icon: () => React.JSX.Element; hasSubOptions?: undefined; subOptions?: undefined; } | { id: string; label: string; description: string; icon: () => React.JSX.Element; hasSubOptions: boolean; subOptions: { id: string; label: string; icon: () => React.JSX.Element; }[]; }) => {
    if (option.hasSubOptions) {
      // Toggle expansion for options with sub-options
      setExpandedOption(expandedOption === option.id ? null : option.id);
    } else {
      // Direct selection for options without sub-options
      setSelectedContext(option.id);
      setExpandedOption(null);
    }
  };

  const handleSubOptionPress = (subOptionId: React.SetStateAction<string>) => {
    setSelectedContext(subOptionId);
  };

  const showDatePicker = () => {
  if (Platform.OS === "android") {
    DateTimePickerAndroid.open({
      value: takenAt,
      mode: "date",
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          // First set the date
          let newDate = new Date(date);

          // Now show time picker
          DateTimePickerAndroid.open({
            value: newDate,
            mode: "time",
            is24Hour: true,
            onChange: (event2, time) => {
              if (event2.type === "set" && time) {
                // Combine date + time
                newDate.setHours(time.getHours());
                newDate.setMinutes(time.getMinutes());
                setTakenAt(newDate);
              }
            },
          });
        }
      },
    });
  } else {
    setShowPicker(true);
  }
};

  const formatDateTime = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")} 
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Glucose</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Glucose Value Display */}
        <View style={styles.valueContainer}>
          <TextInput
            style={styles.valueInput}
            placeholder="168"
            placeholderTextColor="#333"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            maxLength={3}
          />
          <Text style={styles.unit}>mg/dL</Text>

          {/* Glucose Scale with Interactive Slider */}
          <View style={styles.scaleContainer}>
            <TouchableOpacity
              style={styles.sliderContainer}
              onPress={handleSliderMove}
              activeOpacity={1}
            >
              <View >
                <View style={styles.scale}>
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                  <View style={styles.scaleTick} />
                </View>
                <View
                  style={[
                    styles.scaleMarker,
                    { left: `${sliderPosition * 100}%` }
                  ]}
                />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleLabel}>50</Text>
                <Text style={styles.scaleLabel}>140</Text>
                <Text style={styles.scaleLabel}>200</Text>
                <Text style={styles.scaleLabel}>300</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* When was this reading taken */}
        <Text style={styles.sectionTitle}>When was this reading taken?</Text>
        <TouchableOpacity style={styles.timeContainer} onPress={showDatePicker}>
          <Text style={styles.timeText}>{formatDateTime(takenAt)}</Text>
          <ClockIcon />
        </TouchableOpacity>

        {/* Type of reading */}
        <Text style={styles.sectionTitle}>Type of reading</Text>

        {contextOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedContext === option.id;
          const isExpanded = expandedOption === option.id;

          return (
            <View key={option.id}>
              <TouchableOpacity
                style={[
                  styles.optionContainer,
                  isSelected && styles.selectedOption,
                  isExpanded && styles.expandedOption
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <View style={styles.optionLeft}>
                  <IconComponent />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.description ? (
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.optionRight}>
                  {option.hasSubOptions ? (
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d={isExpanded ? "M18 15L12 9L6 15" : "M9 18L15 12L9 6"}
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  ) : (
                    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Sub-options dropdown */}
              {option.hasSubOptions && isExpanded && (
                <View style={styles.subOptionsContainer}>
                  {option.subOptions.map((subOption) => {
                    const SubIconComponent = subOption.icon;
                    const isSubSelected = selectedContext === subOption.id;

                    return (
                      <TouchableOpacity
                        key={subOption.id}
                        style={[
                          styles.subOptionContainer,
                          isSubSelected && styles.selectedOption
                        ]}
                        onPress={() => handleSubOptionPress(subOption.id)}
                      >
                        <View style={styles.optionLeft}>
                          <SubIconComponent />
                          <Text style={styles.subOptionLabel}>{subOption.label}</Text>
                        </View>
                        <View style={[styles.radioButton, isSubSelected && styles.radioButtonSelected]}>
                          {isSubSelected && <View style={styles.radioButtonInner} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {showPicker && Platform.OS === "ios" && (
          <DateTimePicker
            value={takenAt}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              if (date) setTakenAt(date);
            }}
          />
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, (!value || !selectedContext) && styles.disabledButton]}
          onPress={handleSave}
          disabled={!value || !selectedContext}
        >
          <Text style={styles.saveText}>Log reading</Text>
        </TouchableOpacity>
      </View>
<SuccessModal 
  visible={successVisible} 
  onClose={() => setSuccessVisible(false)} 
/>

    </View>
  );
};
export default GlucoseLogForm;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Urbanist_700Bold",
    marginLeft: 8,
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  valueContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    fontFamily: "Urbanist_700Bold",

    marginBottom: 30,
  },
  valueInput: {
    fontSize: 48,
    fontFamily: "Urbanist_700Bold",
    color: "#333",
    textAlign: "center",
    minWidth: 120,
  },
  unit: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    fontFamily: "Urbanist_700Bold",
  },
  scaleContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  sliderContainer: {
    width: 250,
  },
  scale: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  scaleTick: {
    width: 1,
    height: 12,
    backgroundColor: "#DDD",
  },
  scaleMarker: {
    width: 2,
    height: 20,
    backgroundColor: "#4A90E2",
    position: "absolute",
    top: -4,
    left: "50%",
    marginLeft: -1,
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
  },
  scaleLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Urbanist_700Bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
    fontFamily: "Urbanist_700Bold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    fontFamily: "Urbanist_700Bold",
    marginBottom: 30,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Urbanist_700Bold",

  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 8,
    fontFamily: "Urbanist_700Bold",
  },
  selectedOption: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
    borderWidth: 1,
  },
  expandedOption: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionRight: {
    marginLeft: 12,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: "Urbanist_700Bold", color: "#333",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontFamily: "Urbanist_500Medium",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#2196F3",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  subOptionsContainer: {
    // backgroundColor: "#F0F0F0",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    borderBottomLeftRadius: 12,
    fontFamily: "Urbanist_700Bold",
    borderBottomRightRadius: 12,
    paddingHorizontal: 2,
    paddingBottom: 8,
  },
  subOptionContainer: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    fontFamily: "Urbanist_700Bold",
    marginBottom: 4,
  },
  subOptionLabel: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    fontFamily: "Urbanist_700Bold",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#fff",
    fontFamily: "Urbanist_700Bold",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    fontFamily: "Urbanist_700Bold",
    borderRadius: 32,
    alignItems: "center",
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: "#CCC",
    fontFamily: "Urbanist_700Bold",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Urbanist_700Bold",
  },
});