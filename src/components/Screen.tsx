import React from 'react';
import { View, StyleSheet, useColorScheme, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';

interface ScreenProps extends ViewProps {
  safeArea?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ 
  children, 
  style, 
  safeArea = true,
  ...props 
}) => {
  const isDark = useColorScheme() === 'dark';
  const backgroundColor = isDark ? tokens.colors.tealNeutral[900] : tokens.colors.tealNeutral[50];

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={[{ flex: 1, backgroundColor }, style]} {...props}>
      {children}
    </Container>
  );
};
