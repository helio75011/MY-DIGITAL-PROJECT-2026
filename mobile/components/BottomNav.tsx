import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type TabKey = 'Accueil' | 'Historique' | 'Profile' | 'Trajets';

export type NavTab<K extends string = string> = {
  key: K;
  icon: keyof typeof Feather.glyphMap;
  label: string;
};

// Onglets passagère par défaut (rétrocompatibilité).
const PASSENGER_TABS: NavTab<TabKey>[] = [
  { key: 'Accueil', icon: 'home', label: 'ACCUEIL' },
  { key: 'Historique', icon: 'clock', label: 'HISTORIQUE' },
  { key: 'Profile', icon: 'user', label: 'PROFILE' },
  { key: 'Trajets', icon: 'navigation', label: 'TRAJETS' },
];

type Props<K extends string = TabKey> = {
  active: K;
  onNavigate?: (tab: K) => void;
  /** Onglets personnalisés (ex. expérience acteur). Défaut : onglets passagère. */
  tabs?: NavTab<K>[];
};

/**
 * Barre de navigation inférieure commune.
 * Par défaut les 4 onglets passagère ; `tabs` permet une autre liste (acteur).
 * L'onglet `active` est mis en évidence et `onNavigate` est appelé au tap.
 */
export function BottomNav<K extends string = TabKey>({ active, onNavigate, tabs }: Props<K>) {
  const items = (tabs ?? (PASSENGER_TABS as unknown as NavTab<K>[]));
  return (
    <View style={styles.bar}>
      {items.map((tab) => {
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
