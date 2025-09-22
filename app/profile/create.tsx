import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';

type Gender = 'male' | 'female' | '';

interface FormData {
  name: string;
  gender: Gender;
  age: string;
  email: string;
}

interface FormErrors {
  name?: string;
  gender?: string;
  age?: string;
  email?: string;
}

const TapHealthForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    age: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<keyof FormData | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold,
    Urbanist_600SemiBold,
  });

  const nameAnimation = useRef(new Animated.Value(0)).current;
  const emailAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFocus = (field: keyof FormData) => {
    setFocusedField(field);
    const animation = field === 'name' ? nameAnimation : emailAnimation;
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleBlur = (field: keyof FormData) => {
    if (!formData[field]) {
      const animation = field === 'name' ? nameAnimation : emailAnimation;
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
    setFocusedField('');
  };

  const handleGenderSelect = (gender: Gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 120)
      newErrors.age = 'Enter an age between 13-120';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch('https://backend-rnapp.onrender.com/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          gender: formData.gender,
          age: Number(formData.age),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        Animated.sequence([
          Animated.timing(buttonAnimation, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(buttonAnimation, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
          Alert.alert('✅ Success', 'Profile created successfully!', [
            { text: 'Continue', onPress: () => router.replace('/') },
          ]);
        });
      } else {
        const err = await res.json();
        Alert.alert('❌ Failed', err.error || 'Failed to create profile');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Error', 'Failed to create profile. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.gender &&
    formData.age &&
    formData.email &&
    Object.keys(errors).length === 0;

  const getFieldStyle = (animation: Animated.Value) => ({
    borderColor: animation.interpolate({ inputRange: [0, 1], outputRange: ['#E5E7EB', '#3B82F6'] }),
    backgroundColor: animation.interpolate({ inputRange: [0, 1], outputRange: ['#F9FAFB', '#FFFFFF'] }),
    transform: [{ scale: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }],
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
        shadowOpacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }),
        shadowRadius: 8,
      },
      android: {
        elevation: animation.interpolate ? animation.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) : 0,
      },
    }),
  });

  const buttonStyle = {
    transform: [{ scale: buttonAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }) }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDFF" />
      <View style={styles.content}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://i.ibb.co/NnsKWmSv/Logo.png' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Create your account</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name</Text>
            <Animated.View style={[styles.inputContainer, getFieldStyle(nameAnimation)]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
              />
            </Animated.View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>What's your gender?</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonSelected]}
                onPress={() => handleGenderSelect('male')}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'male' && styles.genderButtonTextSelected]}>
                  ♂ Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonFemale]}
                onPress={() => handleGenderSelect('female')}
              >
                <Text style={[styles.genderButtonText, formData.gender === 'female' && styles.genderButtonTextFemale]}>
                  ♀ Female
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          </View>

          {/* Age */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Age</Text>
            <View style={[styles.inputContainer, errors.age && styles.errorInput]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your age"
                placeholderTextColor="#9CA3AF"
                value={formData.age}
                onChangeText={(text) => handleInputChange('age', text)}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email ID</Text>
            <Animated.View style={[styles.inputContainer, getFieldStyle(emailAnimation)]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email ID"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isFormValid ? styles.continueButtonActive : styles.continueButtonInactive,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueButtonText, isFormValid && styles.continueButtonTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 10,
    marginTop: 50,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButtonText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoImage: { width: 100, height: 20, marginRight: 8 },
  title: { fontSize: 28, color: '#111827', marginBottom: 32, lineHeight: 32, fontFamily: 'Urbanist_700Bold' },
  formContainer: { gap: 24 },
  fieldContainer: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: '#374151', marginBottom: 4 },
  inputContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Urbanist_600SemiBold',
    color: '#111827',
    backgroundColor: 'transparent',
  },
  errorInput: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  genderContainer: { flexDirection: 'row', gap: 12 },
  genderButton: { flex: 1, paddingVertical: 16, borderRadius: 32, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  genderButtonSelected: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  genderButtonFemale: { backgroundColor: '#FCE7F3', borderColor: '#F9A8D4' },
  genderButtonText: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: '#374151' },
  genderButtonTextSelected: { color: '#FFFFFF' },
  genderButtonTextFemale: { color: '#EC4899' },
  buttonContainer: { marginTop: 32, marginBottom: 24 },
  continueButton: { paddingVertical: 18, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  continueButtonActive: { backgroundColor: '#2563EB' },
  continueButtonInactive: { backgroundColor: '#D1D5DB' },
  continueButtonText: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: 'gray' },
  continueButtonTextActive: { color: '#FFFFFF' },
});

export default TapHealthForm;
