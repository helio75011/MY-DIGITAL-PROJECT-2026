import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  variant: 'solidaire' | 'premium';
  title: string;
  description: string;
  eta: string;
  /** "15,00€" pour premium ; pour solidaire on affiche "GRATUIT". */
  price?: string;
  onPress?: () => void;
  /** Affiche un spinner et désactive la carte pendant la création du trajet. */
  loading?: boolean;
};

/**
 * Carte de choix de mode de trajet (écran Réserver, Figma 23:2060).
 * variant "solidaire" = fond violet clair, badge GRATUIT.
 * variant "premium"   = fond bleu marine, prix rose.
 */
export function ModeCard({ variant, title, description, eta, price, onPress, loading }: Props) {
  const isPremium = variant === 'premium';
  const textColor = isPremium ? '#ffffff' : colors.routeValue;
  const descColor = isPremium ? colors.onDarkDesc : colors.bodyText;

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: isPremium ? colors.modePremiumBg : colors.modeSolidaireBg },
        loading && styles.cardLoading,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {/* Pastille d'icône (spinner pendant la création du trajet) */}
      <View style={styles.iconTile}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <FontAwesome5 name="female" size={20} color="#ffffff" />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {isPremium ? (
            <Text style={styles.price}>{price}</Text>
          ) : (
            <Text style={styles.free}>GRATUIT</Text>
          )}
        </View>

        <Text style={[styles.description, { color: descColor }]}>{description}</Text>

        <View style={styles.etaRow}>
          <Feather name="clock" size={10} color={textColor} />
          <Text style={[styles.eta, { color: textColor }]}>Arrivée estimée : {eta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 19,
    padding: 22,
    gap: 20,
  },
  cardLoading: {
    opacity: 0.7,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.iconTileRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  price: {
    color: colors.priceRose,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    marginLeft: 8,
  },
  free: {
    color: colors.freeGreen,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  eta: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
