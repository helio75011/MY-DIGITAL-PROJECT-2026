import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  /** Affiche un séparateur sous la ligne. */
  divider?: boolean;
  onPress?: () => void;
};

/**
 * Ligne de menu sur carte sombre (écran Profil, Figma 23:1902) :
 * icône + titre (+ sous-titre vert) à gauche, chevron à droite.
 */
export function MenuRow({ icon, title, subtitle, divider, onPress }: Props) {
  return (
    <View>
      <Pressable style={styles.row} onPress={onPress}>
        <Feather name={icon} size={18} color="#ffffff" style={styles.icon} />
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-right" size={18} color="#ffffff" />
      </Pressable>
      {divider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  icon: {
    width: 24,
  },
  texts: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    color: colors.menuSubGreen,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 2,
  },
});
