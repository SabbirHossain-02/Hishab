import React from 'react';
import { View, ViewProps, StyleSheet, useColorScheme } from 'react-native';
import { tokens } from '../theme/tokens';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat' | 'inset';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'flat', 
  style, 
  ...props 
}) => {
  const isDark = useColorScheme() === 'dark';

  const getVariantStyle = () => {
    switch(variant) {
      case 'elevated':
        return {
          backgroundColor: isDark ? tokens.colors.tealNeutral[700] : '#ffffff',
          ...tokens.shadows.md,
        };
      case 'inset':
        return {
          backgroundColor: isDark ? tokens.colors.tealNeutral[900] : tokens.colors.tealNeutral[50],
          borderWidth: 1,
          borderColor: isDark ? tokens.colors.tealNeutral[800] : tokens.colors.tealNeutral[100],
        };
      case 'flat':
      default:
        return {
          backgroundColor: isDark ? tokens.colors.tealNeutral[800] : tokens.colors.tealNeutral[100],
        };
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        getVariantStyle(),
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    marginVertical: tokens.spacing.sm,
  }
});
