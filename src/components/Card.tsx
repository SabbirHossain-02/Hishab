import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat' | 'inset';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style,
  variant = 'flat', 
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: tokens.colors.tealNeutral[800],
          ...tokens.shadows.sm
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: tokens.colors.tealNeutral[100]
        };
      case 'flat':
      default:
        return {
          backgroundColor: tokens.colors.tealNeutral[800],
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
