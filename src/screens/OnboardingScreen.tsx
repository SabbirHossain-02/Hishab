import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';
import { PieChart, Shield, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Effortless Tracking',
    description: 'We securely read your bKash and Nagad SMS to automatically log your expenses instantly.',
    icon: <Zap size={100} color={tokens.colors.gradient.primary[0]} strokeWidth={1} />,
  },
  {
    id: '2',
    title: 'Absolute Privacy',
    description: 'Your data never leaves your device. We process everything locally for maximum security.',
    icon: <Shield size={100} color={tokens.colors.gradient.primary[0]} strokeWidth={1} />,
  },
  {
    id: '3',
    title: 'Smart Analytics',
    description: 'Visualize your spending habits with beautiful charts and stay on top of your budget.',
    icon: <PieChart size={100} color={tokens.colors.gradient.primary[0]} strokeWidth={1} />,
  }
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Permissions');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <SafeAreaView style={{flex:1}}>
          <FlatList
            data={SLIDES}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width }]}>
                <View style={styles.iconWrapper}>
                  {item.icon}
                </View>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
        </SafeAreaView>
      </View>

      <View style={styles.waveContainer}>
        <Svg height="100" width={width} viewBox={`0 0 ${width} 100`} preserveAspectRatio="none">
          <Path
            d={`M0,50 C${width * 0.3},100 ${width * 0.7},0 ${width},50 L${width},100 L0,100 Z`}
            fill={tokens.colors.gradient.primary[0]}
          />
        </Svg>
      </View>

      <LinearGradient
        colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomSection}
      >
        <View style={styles.textContainer}>
          <Text variant="xl" weight="bold" style={styles.title}>
            {SLIDES[currentIndex].title}
          </Text>
          <Text variant="base" style={styles.description}>
            {SLIDES[currentIndex].description}
          </Text>
        </View>

        <View style={styles.paginationContainer}>
          {SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return <Animated.View style={[styles.dot, { opacity }]} key={i.toString()} />;
          })}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title={currentIndex === SLIDES.length - 1 ? "GET STARTED" : "NEXT"}
            variant="text"
            onPress={handleNext}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topSection: {
    flex: 0.55,
    backgroundColor: '#ffffff',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    height: 100,
    width: '100%',
    position: 'absolute',
    top: height * 0.55 - 50,
    zIndex: 1,
  },
  bottomSection: {
    flex: 0.45,
    paddingTop: 60,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl + 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    color: '#ffffff',
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: tokens.spacing.xl,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: tokens.borderRadius.pill,
    paddingVertical: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: tokens.colors.gradient.primary[0],
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
