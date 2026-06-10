import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Menu de dev pour basculer entre les écrans sans navigation.
 * À retirer une fois la vraie navigation en place.
 *
 * Usage : <ScreenSwitcher screens={['Welcome', ...]} current={...} onSelect={...} />
 */
type Props<T extends string> = {
  screens: readonly T[];
  current: T;
  onSelect: (screen: T) => void;
};

export function ScreenSwitcher<T extends string>({ screens, current, onSelect }: Props<T>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      {open && (
        <View style={styles.panel}>
          <Text style={styles.heading}>DEV · Écrans</Text>
          {screens.map((s) => {
            const active = s === current;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  onSelect(s);
                  setOpen(false);
                }}
                style={[styles.item, active && styles.itemActive]}
              >
                <Text style={[styles.itemText, active && styles.itemTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Pressable style={styles.fab} onPress={() => setOpen((v) => !v)}>
        <Feather name={open ? 'x' : 'layers'} size={20} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: 12,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 6, 102, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  panel: {
    marginBottom: 12,
    backgroundColor: 'rgba(0, 6, 102, 0.92)',
    borderRadius: 16,
    padding: 8,
    minWidth: 160,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  heading: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  itemText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  itemTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
