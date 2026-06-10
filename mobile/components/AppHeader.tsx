import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { Logo } from './Logo';

type Props = {
  /** Action de l'icône réglages (engrenage). */
  onSettings?: () => void;
};

/**
 * En-tête commun : logo Link & Walk à gauche, icône réglages à droite,
 * sur fond blanc, sous la safe-area du haut.
 */
export function AppHeader({ onSettings }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Logo size={40} />
          <Text style={styles.logoText}>Link & walk</Text>
        </View>
        <Pressable hitSlop={8} onPress={onSettings}>
          <Feather name="settings" size={22} color={colors.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#ffffff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 11,
    color: colors.primary,
  },
});
