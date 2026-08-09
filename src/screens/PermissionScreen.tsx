import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { tokens } from '../theme/tokens';
import { ShieldCheck, MessageSquare, Bell } from 'lucide-react-native';
import { requestNotificationPermission } from '../services/notificationService';

export const PermissionScreen = ({ navigation }: any) => {

  const requestPermissions = async () => {
    console.log("Requesting permissions...");
    
    // Request Push Notifications
    await requestNotificationPermission();

    // Native SMS permission would be requested here in full prod
    
    // Simulate delay
    setTimeout(() => {
      navigation.replace('Home');
    }, 1000);
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <ShieldCheck size={48} color={tokens.colors.semantic.success} style={styles.icon} />
        <Text variant="xl" weight="bold" style={styles.title}>
          How Hishab Works
        </Text>
        <Text variant="base" muted style={styles.subtitle}>
          Hishab requires permission to read your incoming SMS to provide automatic budget and expense tracking.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.featureRow}>
            <View style={styles.iconContainer}>
              <MessageSquare size={24} color={tokens.colors.tealNeutral[100]} />
            </View>
            <View style={styles.featureText}>
              <Text weight="bold" variant="base">SMS Permission</Text>
              <Text variant="sm" muted>Used exclusively for financial transaction parsing (bKash and Nagad) to automatically update your budgets and dashboard. Personal messages are ignored.</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.featureRow}>
            <View style={styles.iconContainer}>
              <Bell size={24} color={tokens.colors.tealNeutral[100]} />
            </View>
            <View style={styles.featureText}>
              <Text weight="bold" variant="base">Notification Access</Text>
              <Text variant="sm" muted>Required to catch transactions silently in the background without needing you to open the app.</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.featureRow}>
            <View style={styles.iconContainer}>
              <MessageSquare size={24} color={tokens.colors.tealNeutral[100]} />
            </View>
            <View style={styles.featureText}>
              <Text weight="bold" variant="base">Push Notifications (Android 13+)</Text>
              <Text variant="sm" muted>Used exclusively to alert you when a transaction pushes you over your monthly category budget limit. No spam, ever.</Text>
            </View>
          </View>
        </Card>

        <Card variant="flat" style={styles.trustCard}>
          <Text variant="sm" muted style={styles.trustText}>
            🔒 Your privacy is absolute. SMS data is read locally on your device for parsing purposes only. We never send your messages to external servers or share them with any third parties.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Grant Permissions" 
          variant="primary" 
          size="large"
          onPress={requestPermissions}
        />
        <Button 
          title="Not Now" 
          variant="text" 
          size="medium"
          onPress={() => console.log('Denied')}
          style={{ marginTop: tokens.spacing.md }}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  icon: {
    marginBottom: tokens.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  card: {
    marginBottom: tokens.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.gradient.primary[0], // using first color of gradient as solid
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  featureText: {
    flex: 1,
  },
  trustCard: {
    marginTop: tokens.spacing.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.colors.tealNeutral[100],
  },
  trustText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: tokens.spacing.lg,
  }
});
