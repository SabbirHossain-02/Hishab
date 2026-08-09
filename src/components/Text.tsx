import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, useColorScheme } from 'react-native';
import { tokens } from '../theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof tokens.typography.size;
  weight?: keyof typeof tokens.typography.weight;
  color?: string;
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'base', 
  weight = 'regular', 
  color, 
  muted = false,
  style, 
  ...props 
}) => {
  const isDark = useColorScheme() === 'dark';
  
  const defaultColor = muted 
    ? (isDark ? tokens.colors.tealNeutral.textMutedDark : tokens.colors.tealNeutral.textMutedLight)
    : (isDark ? tokens.colors.tealNeutral.textLight : tokens.colors.tealNeutral.textDark);

  return (
    <RNText
      style={[
        {
          fontSize: tokens.typography.size[variant],
          fontWeight: tokens.typography.weight[weight] as any, // Type assertion for RN font weight
          color: color || defaultColor,
          fontFamily: variant === 'display' ? tokens.typography.fontFamily.display : tokens.typography.fontFamily.sans,
        },
        style,
      ]}
      {...props}
    />
  );
};
