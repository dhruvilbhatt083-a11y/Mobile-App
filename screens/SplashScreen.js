import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

const DOT_COLORS = ['#8ABAFD', '#8ABAFD', '#1F7CFF'];

const SplashScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dotAnimations = useRef(DOT_COLORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = dotAnimations.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(anim, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 420,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => loops.forEach((loop) => loop.stop && loop.stop());
  }, [dotAnimations]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('RoleSelection');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <View style={styles.contentWrapper}>
        <Image
          source={require('../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>UrbanFleet X</Text>
        <Text style={styles.tagline}>Your Fleet Partner</Text>
        <View style={styles.dotsRow}>
          {DOT_COLORS.map((color, index) => (
            <Animated.View
              key={`${color}-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor: color,
                  opacity: dotAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    {
                      scale: dotAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.25],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
      <Text style={[styles.footerText, { marginBottom: Math.max(insets.bottom + 16, 24) }] }>
        UrbanFleet X • Ahmedabad
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 12,
  },
  appName: {
    ...FONTS.h2,
    color: '#000000',
    fontWeight: '700',
    textAlign: 'center',
  },
  tagline: {
    ...FONTS.body3,
    fontSize: 13,
    color: '#6D6D6D',
    marginTop: 16,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    ...FONTS.body4,
    color: '#A0A0A0',
    textAlign: 'center',
    fontSize: 11,
  },
});

export default SplashScreen;
