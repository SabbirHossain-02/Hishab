import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, useColorScheme, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { tokens } from '../theme/tokens';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}) => {
  const isDark = useColorScheme() === 'dark';
  
  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100] };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1, 
          borderColor: isDark ? tokens.colors.tealNeutral[700] : tokens.colors.tealNeutral[100] 
        };
      case 'text':
        return { backgroundColor: 'transparent' };
      default:
        return {}; // Primary handled by gradient
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#FFFFFF';
    if (variant === 'outline' || variant === 'text') {
      return isDark ? tokens.colors.tealNeutral.textLight : tokens.colors.tealNeutral.textDark;
    }
    return isDark ? tokens.colors.tealNeutral.textLight : tokens.colors.tealNeutral.textDark;
  };

  const getPadding = () => {
    switch(size) {
      case 'small': return { paddingVertical: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md };
      case 'large': return { paddingVertical: tokens.spacing.lg, paddingHorizontal: tokens.spacing.xl };
      default: return { paddingVertical: tokens.spacing.md, paddingHorizontal: tokens.spacing.lg };
    }
  };

  const innerContent = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} style={{ marginRight: tokens.spacing.sm }} />
      ) : null}
      {icon && <View style={{ marginRight: tokens.spacing.sm }}>{icon}</View>}
      <Text weight="bold" color={getTextColor()} variant="base">{title}</Text>
    </>
  );

  const containerStyle = [
    styles.container,
    getContainerStyle(),
    getPadding(),
    { opacity: disabled || loading ? 0.6 : 1 },
    style
  ];

  if (variant === 'primary') {
    return (
      <TouchableOpacity disabled={disabled || loading} {...props}>
        <LinearGradient
          colors={tokens.colors.gradient.primary as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={containerStyle}
        >
          {innerContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={containerStyle}
      disabled={disabled || loading} 
      {...props}
    >
      {innerContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
