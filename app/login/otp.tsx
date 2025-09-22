/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold } from '@expo-google-fonts/urbanist';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  TextInputKeyPressEvent,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get('window');
const BackArrow = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke="#1F2937"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);



export default function OTPScreen() {
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  // Refs for OTP inputs
  const inputRefs = useRef([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Format phone number
  const formattedPhone = phone?.toString().trim().startsWith("+")
    ? phone.toString().trim()
    : `+${phone?.toString().trim()}`;

  const maskedPhone = formattedPhone.replace(/(\+91)(\d{6})(\d{4})/, '$1 $2***$3');

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-verify when all digits are entered
    const otpString = otp.join('');
    if (otpString.length === 6) {
      handleVerifyOTP(otpString);
    }
  }, [otp]);

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const [fontsLoaded] = useFonts({ Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold });

  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const handleKeyPress = (e: TextInputKeyPressEvent, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = async (otpString = otp.join('')) => {
    if (otpString.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter all 6 digits");
      shakeInputs();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://backend-rnapp.onrender.com/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, otp: otpString }),
      });

      const data = await response.json();
      console.log("📲 OTP Verify Response:", data);

      if (response.ok && data?.token) {
        await AsyncStorage.setItem('authToken', data.token);
        console.log('✅ Token saved to AsyncStorage');

        // Success animation before navigation
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          router.push('/profile/create');
        });
      } else {
        Alert.alert("❌ Verification Failed", data.error || "Invalid OTP. Please try again.");
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        shakeInputs();
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      Alert.alert("❌ Error", "Failed to verify OTP. Please check your connection.");
      shakeInputs();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCountdown(30);
    setCanResend(false);

    try {
      await fetch('https://backend-rnapp.onrender.com/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      Alert.alert("✅ OTP Sent", "A new OTP has been sent to your phone");
    } catch (err) {
      Alert.alert("❌ Error", "Failed to resend OTP");
      setCanResend(true);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnimation,
                transform: [{
                  translateY: fadeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <BackArrow width={24} height={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Enter 6 digit OTP Code</Text>
              <Text style={styles.subtitle}>
                We have sent the OTP to {maskedPhone}
              </Text>
            </View>

            {/* OTP Input Section */}
            <Animated.View
              style={[
                styles.otpContainer,
                { transform: [{ translateX: shakeAnimation }] }
              ]}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null,
                    isLoading && styles.otpInputDisabled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                  selectionColor="#6366F1"
                />
              ))}
            </Animated.View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                (otp.join('').length === 6) ? styles.continueButtonActive : styles.continueButtonInactive
              ]}
              onPress={() => handleVerifyOTP()}
              disabled={otp.join('').length !== 6 || isLoading}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.continueButtonText,
                (otp.join('').length === 6) ? styles.continueButtonTextActive : styles.continueButtonTextInactive
              ]}>
                Continue
              </Text>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Didn't receive the OTP? </Text>
              <TouchableOpacity onPress={handleResendOTP} disabled={!canResend}>
                <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                  Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* Countdown */}
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                {formatCountdown(countdown)}
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Root container
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Keyboard avoiding wrapper
  keyboardContainer: {
    flex: 1,
  },

  // Main content wrapper
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // Back button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  backArrow: {
    fontSize: 64,
    fontFamily: "Urbanist_700Bold",
    color: '#6B7280',
  },

  // Header section
  header: {
    marginBottom: 60,
    fontFamily: "Urbanist_700Bold",

  },
  title: {
    fontSize: 24,
    fontFamily: "Urbanist_700Bold",
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: "Urbanist_500Medium",

    lineHeight: 24,
  },

  // OTP input container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 8,
  },

  // Individual OTP input box
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: "Urbanist_700Bold",
    color: '#1F2937',
    marginHorizontal: 2,

  },
  otpInputFilled: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },

  // Continue button
  continueButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    fontFamily: "Urbanist_700Bold",

  },
  continueButtonActive: {
    backgroundColor: '#6366F1',
    fontFamily: "Urbanist_700Bold",

  },
  continueButtonInactive: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: "Urbanist_700Bold",

  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  continueButtonTextInactive: {
    color: '#FFFFFF',
  },

  // Resend section
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: "Urbanist_700Bold",

  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    fontFamily: "Urbanist_700Bold",

  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },

  // Countdown
  countdownContainer: {
    alignItems: 'center',
    fontFamily: "Urbanist_700Bold",

  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: "Urbanist_700Bold",

  },
});