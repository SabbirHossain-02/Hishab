import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[tokens.colors.tealNeutral[900], tokens.colors.tealNeutral[50]]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative background glow for Light Theme */}
      <View style={styles.glowCircle1} />
      <View style={styles.glowCircle2} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <Text variant="display" weight="bold" style={styles.title}>
          Hishab
        </Text>
        <Text variant="lg" weight="medium" style={styles.subtitle}>
          আপনার প্রতিটা টাকার হিসাব, একদম নিজে নিজে।
        </Text>
        
        <Text variant="base" muted style={styles.description}>
          Hishab securely reads your bKash and Nagad SMS to automatically track your expenses. 
          No manual entry needed.
        </Text>
      </View>

      <View style={styles.footer}>
        <LinearGradient
          colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Button 
            title="Get Started" 
            variant="text" 
            size="large"
            onPress={() => navigation.navigate('Permissions')}
            style={styles.buttonTransparent}
            textStyle={styles.buttonText}
          />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.tealNeutral[900],
  },
  glowCircle1: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(74, 0, 224, 0.05)',
    transform: [{ scaleX: 1.2 }],
  },
  glowCircle2: {
    position: 'absolute',
    bottom: height * 0.1,
    right: -width * 0.3,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(142, 45, 226, 0.05)',
    transform: [{ scaleY: 1.3 }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  logoContainer: {
    padding: tokens.spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: tokens.colors.tealNeutral[100],
    marginBottom: tokens.spacing.xl,
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24, 
  },
  title: {
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: tokens.colors.tealNeutral.textDark,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    color: tokens.colors.tealNeutral.textMutedDark, 
    lineHeight: 28,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: tokens.spacing.md,
    color: tokens.colors.tealNeutral.textMutedLight,
  },
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
  },
  buttonGradient: {
    borderRadius: tokens.borderRadius.pill,
    shadowColor: tokens.colors.gradient.primary[0],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonTransparent: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  }
});
