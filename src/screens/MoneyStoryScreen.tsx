import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { tokens } from '../theme/tokens';
import { fetchMoneyStory } from '../services/moneyStoryService';
import { Sparkles, Share2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const MoneyStoryScreen = ({ navigation }: any) => {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    const loadStory = async () => {
      setLoading(true);
      const fetchedStory = await fetchMoneyStory();
      setStory(fetchedStory);
      setLoading(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    };

    loadStory();
  }, []);

  if (loading) {
    return (
      <Screen style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tokens.colors.semantic.success} />
        <Text variant="base" muted style={{marginTop: tokens.spacing.md}}>Analyzing your month...</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="xl" weight="bold">Money Story</Text>
        <Text variant="base" muted>Your month in review</Text>
      </View>

      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyCard}
        >
          <View style={styles.sparkleIcon}>
            <Sparkles color="#FFF" size={32} />
          </View>
          
          <Text variant="display" weight="bold" style={styles.storyText}>
            {story}
          </Text>
          
          <View style={styles.brandingFooter}>
            <Text variant="sm" weight="bold" style={styles.brandName}>hishab.</Text>
            <Text variant="xs" style={styles.brandTag}>Your personal finance assistant</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.actions}>
        <Button 
          title="Share Story" 
          variant="primary" 
          icon={<Share2 size={20} color="#FFF" />} 
          onPress={() => console.log('Share triggered')} 
        />
        <Button 
          title="Close" 
          variant="secondary" 
          style={{marginTop: tokens.spacing.md}}
          onPress={() => navigation.goBack()} 
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: tokens.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
  },
  cardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  storyCard: {
    width: width - tokens.spacing.md * 2,
    aspectRatio: 0.75, // Tall, Instagram Story-like proportion
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    justifyContent: 'center',
    ...tokens.shadows.lg,
  },
  sparkleIcon: {
    position: 'absolute',
    top: tokens.spacing.xl,
    left: tokens.spacing.xl,
    opacity: 0.8,
  },
  storyText: {
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: 48,
  },
  brandingFooter: {
    position: 'absolute',
    bottom: tokens.spacing.xl,
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: tokens.spacing.md,
  },
  brandName: {
    color: '#FFFFFF',
  },
  brandTag: {
    color: 'rgba(255,255,255,0.7)',
  },
  actions: {
    paddingVertical: tokens.spacing.xl,
  }
});
