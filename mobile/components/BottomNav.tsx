import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type TabKey = 'Accueil' | 'Historique' | 'Profile' | 'Trajets';

type Tab = {
  key: TabKey;
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

const TABS: Tab[] = [
  { key: 'Accueil', icon: 'home', label: 'ACCUEIL' },
  { key: 'Historique', icon: 'clock', label: 'HISTORIQUE' },
  { key: 'Profile', icon: 'user', label: 'PROFILE' },
  { key: 'Trajets', icon: 'navigation', label: 'TRAJETS' },
];

type Props = {
  active: TabKey;
  onNavigate?: (tab: TabKey) => void;
};

/**
 * Barre de navigation inférieure commune (4 onglets).
 * Utilisée par tous les écrans applicatifs ; l'onglet `active` est mis
 * en évidence et `onNavigate` est appelé au tap.
 */
export function BottomNav({ active, onNavigate }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => onNavigate?.(tab.key)}
          >
            <Feather name={tab.icon} size={18} color={colors.navy} />
            <Text style={styles.label}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.barSurface,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 32,
  },
  itemActive: {
    backgroundColor: colors.navProfileBg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    marginTop: 4,
    color: colors.navy,
  },
});
