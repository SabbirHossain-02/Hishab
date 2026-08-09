import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';

export const OnboardingScreen = ({ navigation }: any) => {
  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        
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
        <Button 
          title="Get Started" 
          variant="primary" 
          size="large"
          onPress={() => navigation.navigate('Permissions')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: tokens.spacing.xl,
    borderRadius: 30, // Smooth rounded corners for the icon
  },
  title: {
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    color: tokens.colors.tealNeutral.textMutedLight, // Adjust based on theme in real app
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: tokens.spacing.lg,
  }
});
