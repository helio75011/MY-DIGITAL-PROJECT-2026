import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type Companion = {
  id: string;
  name: string;
  rating: string;
  time: string;
  distance: string;
};

/**
 * Carte d'une accompagnatrice à proximité (écran Matching, Figma 23:2122) :
 * avatar + pastille "disponible", nom, note (cœur + valeur),
 * temps + distance, bouton "Sélectionner".
 */
export function CompanionCard({ companion, onSelect }: { companion: Companion; onSelect?: () => void }) {
  return (
    <View style={styles.card}>
      {/* Avatar + pastille disponible */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={colors.companionCardBg} />
        </View>
        <View style={styles.availableDot}>
          <Feather name="check" size={9} color={colors.companionCardBg} />
        </View>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.name}>{companion.name}</Text>
        <View style={styles.metaRow}>
          <Feather name="clock" size={12} color={colors.metaText} />
          <Text style={styles.meta}>{companion.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="map-marker-distance" size={12} color={colors.metaText} />
          <Text style={styles.meta}>{companion.distance}</Text>
        </View>
      </View>

      {/* Note + bouton */}
      <View style={styles.right}>
        <View style={styles.rating}>
          <FontAwesome name="heart" size={13} color={colors.heartRed} />
          <Text style={styles.ratingText}>{companion.rating}</Text>
        </View>
        <Pressable style={styles.selectBtn} onPress={onSelect}>
          <Text style={styles.selectText}>Sélectionner</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.companionCardBg,
    borderRadius: 10,
    padding: 19,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.availableDot,
    borderWidth: 1.8,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    color: colors.metaText,
    fontSize: 14,
  },
  right: {
    alignItems: 'flex-end',
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ratingBg,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 17,
  },
  ratingText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  selectBtn: {
    backgroundColor: colors.selectBtnBg,
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 13,
  },
  selectText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
