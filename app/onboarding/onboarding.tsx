import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SwiperFlatList from "react-native-swiper-flatlist";

// Import Urbanist fonts
import { useFonts, Urbanist_400Regular, Urbanist_500Medium, Urbanist_700Bold } from '@expo-google-fonts/urbanist';

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Personalized Meals",
    subtitle: "Enjoy tasty, expert-designed diets to match your health goals.",
    image: { uri: "https://i.ibb.co/DPCv2pbD/slide1.png" },
  },
  {
    id: "2",
    title: "Track Progress",
    subtitle: "Stay on top of your sugar, weight, and health milestones.",
    image: { uri: "https://i.ibb.co/MyJb9Mq3/slide2.png" },
  },
  {
    id: "3",
    title: "Expert Support",
    subtitle: "Get diet plans curated by health professionals.",
    image: { uri: "https://i.ibb.co/TMHYdcgT/slide3-1.png" },
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load Urbanist font
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem("onboardingSeen");
      if (seen) {
      router.replace("/login/phone"); // skip if already seen
      }
    };
    checkOnboarding();
  }, []);

  const handleFinish = async () => {
  router.replace("/login/phone");
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SwiperFlatList
        data={slides}
        showPagination
        paginationStyle={{ position: "absolute", top: 50 }}
        paginationStyleItem={{ width: 44, height: 4, borderRadius: 2, marginHorizontal: 4 }}
        paginationStyleItemActive={{ backgroundColor: "#2563EB" }}
        paginationStyleItemInactive={{ backgroundColor: "#E5E7EB" }}
        onChangeIndex={({ index }) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            {/* <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text> */}
          </View>
        )}
        pagingEnabled
        contentContainerStyle={{ alignItems: "center" }}
      />

      <TouchableOpacity
        style={[
          styles.ctaButton,
          currentIndex === slides.length - 1
            ? { backgroundColor: "#2563EB", borderRadius: 32 }
            : { backgroundColor: "transparent", borderWidth: 2, borderColor: "#2563EB", borderRadius: 32 },
        ]}
        onPress={handleFinish}
      >
        <Text
          style={[
            styles.ctaText,
            currentIndex === slides.length - 1 ? { color: "#fff" } : { color: "#2563EB" },
          ]}
        >
          Join Tap Health
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width: width - 60,
    height: 550,
    alignItems: "center",
    marginRight: 30,
    marginLeft: 30,
    backgroundColor: "#fff",
    borderRadius: 24,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
    alignSelf: "center",
  },
  image: {
    width: 299,
    height: 500,
   

  },
//   title: {
//     fontSize: 22,
//     fontFamily: "Urbanist_700Bold", // bold Urbanist
//     textAlign: "center",
//   borderTopLeftRadius: 150,  // upper left curve
//   borderTopRightRadius: 150, // upper right curve
//   // remove bottom radii

//     color: "#111827",
//   },
//   subtitle: {
//     fontSize: 16,
//     fontFamily: "Urbanist_400Regular", // regular Urbanist
//     textAlign: "center",
//     color: "#6B7280",
//     marginTop: 12,
//   },
  ctaButton: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 18,
    fontFamily: "Urbanist_500Medium", // medium Urbanist
  },
});
