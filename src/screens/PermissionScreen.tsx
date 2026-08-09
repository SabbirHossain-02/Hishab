import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';
import { ShieldCheck, MessageSquare, Bell } from 'lucide-react-native';
import { requestNotificationPermission } from '../services/notificationService';

const { width, height } = Dimensions.get('window');

export const PermissionScreen = ({ navigation }: any) => {

  const requestPermissions = async () => {
    console.log("Requesting permissions...");
    await requestNotificationPermission();
    setTimeout(() => {
      navigation.replace('Home');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[tokens.colors.tealNeutral[900], tokens.colors.tealNeutral[50]]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Decorative background glow */}
      <View style={styles.glowCircle1} />

      <View style={styles.header}>
        <View style={styles.iconContainerMain}>
          <ShieldCheck size={40} color={tokens.colors.gradient.primary[0]} strokeWidth={2.5} />
        </View>
        <Text variant="xl" weight="bold" style={styles.title}>
          How Hishab Works
        </Text>
        <Text variant="base" muted style={styles.subtitle}>
          Hishab requires permission to read your incoming SMS to provide automatic budget and expense tracking.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.featureRow}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(74, 0, 224, 0.1)' }]}>
              <MessageSquare size={22} color={tokens.colors.gradient.primary[0]} />
            </View>
            <View style={styles.featureText}>
              <Text weight="bold" variant="base" style={styles.cardTitle}>SMS Permission</Text>
              <Text variant="sm" muted style={styles.cardDesc}>Used exclusively for financial transaction parsing (bKash and Nagad) to automatically update your budgets and dashboard. Personal messages are ignored.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.featureRow}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(142, 45, 226, 0.1)' }]}>
              <Bell size={22} color={tokens.colors.gradient.primary[1]} />
            </View>
            <View style={styles.featureText}>
              <Text weight="bold" variant="base" style={styles.cardTitle}>Notification Access</Text>
              <Text variant="sm" muted style={styles.cardDesc}>Required to catch transactions silently in the background without needing you to open the app.</Text>
            </View>
          </View>
        </View>

        <View style={styles.trustCard}>
          <Text variant="sm" muted style={styles.trustText}>
            🔒 Your privacy is absolute. SMS data is read locally on your device for parsing purposes only. We never send your messages to external servers or share them with any third parties.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradient
          colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Button 
            title="Grant Permissions" 
            variant="text" 
            size="large"
            onPress={requestPermissions}
            style={styles.buttonTransparent}
            textStyle={styles.buttonText}
          />
        </LinearGradient>
        <Button 
          title="Not Now" 
          variant="text" 
          size="medium"
          onPress={() => navigation.replace('Home')}
          style={styles.notNowButton}
          textStyle={styles.notNowText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.tealNeutral[900],
  },
  glowCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(74, 0, 224, 0.04)',
    transform: [{ scale: 1.2 }],
  },
  header: {
    alignItems: 'center',
    paddingTop: tokens.spacing.xxl + tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  iconContainerMain: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 0, 224, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 0, 224, 0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
    letterSpacing: 0.5,
    color: tokens.colors.tealNeutral.textDark,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: tokens.spacing.sm,
    color: tokens.colors.tealNeutral.textMutedLight,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  card: {
    marginBottom: tokens.spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.tealNeutral[100],
    shadowColor: '#4A00E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  featureText: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
    color: tokens.colors.tealNeutral.textDark,
  },
  cardDesc: {
    lineHeight: 20,
    color: tokens.colors.tealNeutral.textMutedLight,
  },
  trustCard: {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.md,
    backgroundColor: 'transparent',
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.tealNeutral[100],
  },
  trustText: {
    textAlign: 'center',
    lineHeight: 22,
    color: tokens.colors.tealNeutral.textMutedDark,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
    paddingTop: tokens.spacing.md,
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
  },
  notNowButton: {
    marginTop: tokens.spacing.sm,
  },
  notNowText: {
    color: tokens.colors.tealNeutral.textMutedLight,
  }
});
