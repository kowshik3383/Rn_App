import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    startEntranceAnimation();

    const checkAuthWithDelay = async () => {
      const startTime = Date.now();
      const minSplashDuration = 2000;

      try {
        const [token, user] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user')
        ]);

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minSplashDuration - elapsedTime);

        setTimeout(() => {
          setAuthChecked(true);
          startExitAnimation(() => {
            if (token && user) {
              router.replace('/');
            } else {
              router.replace('/onboarding/onboarding');
            }
          });
        }, remainingTime);
      } catch {
        setTimeout(() => {
          setAuthChecked(true);
          startExitAnimation(() => {
            router.replace('/login/phone');
          });
        }, 2000);
      }
    };

    checkAuthWithDelay();
  }, []);

  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();
  };

  const startExitAnimation = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -40,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(callback);
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo */}
            <Image
              source={{
                uri: 'https://tap.health/wp-content/themes/taphealthTwo/assets/images/logo.webp'
              }}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Round Loader */}
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
