import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useFonts, Urbanist_400Regular, Urbanist_500Medium,Urbanist_600SemiBold, Urbanist_700Bold } from '@expo-google-fonts/urbanist';
// ✅ Success Modal
const SuccessModal = ({ visible, onClose }) => {
  const [fontsLoaded] = useFonts({
	Urbanist_400Regular,
	Urbanist_500Medium,
Urbanist_600SemiBold,
	Urbanist_700Bold
  });
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);
  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
        >
          {/* Blue Circle with Check */}
          <View style={styles.iconWrapper}>
            <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" fill="#3B82F6" />
              <Path
                d="M8 12.5L11 15.5L16 9.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>
            Your glucose log has been saved 🎉
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: 340,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    color: "#1E3A8A",
    marginBottom: 8,
    fontFamily: "Urbanist_700Bold",
  },
  message: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Urbanist_500Medium",
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 32,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Urbanist_600SemiBold",
  },
});
