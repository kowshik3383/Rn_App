import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';


const { width, height } = Dimensions.get('window');

export default function TopHealthJoinScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const router = useRouter();
  // Load Urbanist font
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold,
    Urbanist_600SemiBold
  });
  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      return alert('Please enter a valid 10-digit phone number');
    }

    const fullPhone = `+91${phone}`;
    setIsLoading(true);

    try {
      await fetch('https://backend-rnapp.onrender.com/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      console.log('OTP sent to', fullPhone);
      router.push({
        pathname: "/login/otp",
        params: { phone: fullPhone },
      });
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#3B5998" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Top Header Section with Background */}
          <View style={styles.topSection}>
            <LinearGradient
              colors={['#4A6BC7', '#3B5998']}
              style={styles.headerGradient}
            >
              {/* Plus Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.plusIcon}>
                  <Text style={styles.plusText}>t</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.mainTitle}>Join Top Health</Text>
            </LinearGradient>

            {/* Curved bottom section */}
            <View style={styles.curvedBottom} />
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.featureText}>24/7 Health Assistant, Completely Free!</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.featureText}>Answer any medical or health question</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.featureText}>Make sense of your symptoms</Text>
              </View>
            </View>

            {/* Phone Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Enter your phone number to join</Text>

              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeSection}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="8328107601"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>
            </View>

            {/* Checkbox Section */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setReceiveUpdates(!receiveUpdates)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, receiveUpdates && styles.checkboxChecked]}>
                {receiveUpdates && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I would like to receive updates via Whatsapp
              </Text>
            </TouchableOpacity>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!phone || phone.length !== 10 || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={handleSendOTP}
              disabled={!phone || phone.length !== 10 || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !phone || phone.length !== 10 || isLoading
                    ? ['#b0b0b04c', '#90909053']
                    : ['blue', '#357ABD']
                }
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Text>
                {!isLoading && <Text style={styles.arrowIcon}>→</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    // fontFamily: "Urbanist_500Medium", // medium Urbanist

  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    position: 'relative',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: width * 0.3,  // 30% of screen width
    borderBottomRightRadius: width * 0.3, // symmetrical curve
    overflow: "hidden",
  },


  iconContainer: {
    marginBottom: 20,
  },
  plusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  plusText: {
    fontSize: 24,
    color: '#FFFFFF',
    // fontWeight: 'bold',
    fontFamily: "Urbanist_700Bold", // medium Urbanist
    // fontFamily: "Urbanist_700Bold", // instead of fontWeight


  },
  mainTitle: {
    fontSize: 28,
    // fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: "Urbanist_700Bold", // must be applied here

  },
  curvedBottom: {
    
    backgroundColor: '#3B5998',
borderBottomEndRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    transform: [{ scaleX: 2 }],
    
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
// alignContent: "end",
// alignItems: ,
justifyContent: "flex-end",
    // paddingTop: 60,
    // paddingBottom: 40,
  },
  featuresList: {
    // marginBottom: 40,
backgroundColor: '#FFFFFF',
// padding:,
paddingTop: 16,
paddingBottom: 16,
borderRadius: 12,
// marginEndBottom: 24
marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#686a68ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: "Urbanist_700Bold", // must be applied here
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: "Urbanist_600SemiBold",
    flex: 1,
  },
  inputSection: {
    marginBottom: 24,
    fontFamily: "Urbanist_700Bold",

  },
  inputLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
    fontWeight: '500',
    fontFamily: "Urbanist_700Bold",

  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    paddingHorizontal: 20,
    paddingVertical: 4,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
    fontFamily: "Urbanist_700Bold",

  },
  countryCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    fontFamily: "Urbanist_700Bold",

  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#2C3E50',
    // fontWeight: '600',
    fontFamily: "Urbanist_700Bold",

  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: 'gray',
    paddingVertical: 16,
    // fontWeight: '500',
    fontFamily: "Urbanist_700Bold",

  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'gray',
    borderColor: 'gray',
// borderCurved: 4,
    borderRadius: 48,
  },
  checkboxTick: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    fontFamily: "Urbanist_700Bold",

  },
  sendButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // elevation: 6,
    fontFamily: "Urbanist_700Bold",

  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "Urbanist_700Bold",

  },
  sendButtonText: {
    fontSize: 18,
    // fontWeight: 'bold',
    fontFamily: "Urbanist_700Bold",

    color: '#FFFFFF',
    marginRight: 8,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: "Urbanist_700Bold",

    // fontWeight: 'bold',
  },
});