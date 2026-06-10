import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type Trip = {
  id: string;
  name: string;
  /** 'driver' = chauffeur payant, 'walk' = accompagnement Link & Walk gratuit */
  kind: 'driver' | 'walk';
  /** Prix affiché pour un chauffeur (ex. "24,50€"). Ignoré si kind === 'walk'. */
  price?: string;
  date: string;
  departurePlace: string;
  departureTime: string;
  arrivalPlace: string;
  arrivalTime: string;
};

/**
 * Carte d'un trajet passé (écran Historique, Figma 23:1310).
 * Affiche l'accompagnatrice/chauffeur, le badge de type, le prix/statut,
 * la date et la timeline départ → arrivée.
 */
export function TripCard({ trip }: { trip: Trip }) {
  const isDriver = trip.kind === 'driver';

  return (
    <View style={styles.card}>
      {/* Ligne haute : avatar + nom + badge / prix + statut */}
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={colors.tripCardBg} />
        </View>

        <View style={styles.identity}>
          <Text style={styles.name}>{trip.name}</Text>
          <View style={[styles.badge, isDriver ? styles.badgeDriver : styles.badgeWalk]}>
            <Text style={[styles.badgeText, isDriver ? styles.badgeDriverText : styles.badgeWalkText]}>
              {isDriver ? 'Chauffeur' : 'Link & Walk'}
            </Text>
          </View>
        </View>

        <View style={styles.priceCol}>
          {isDriver ? (
            <>
              <Text style={styles.price}>{trip.price}</Text>
              <Text style={styles.paid}>Payé</Text>
            </>
          ) : (
            <Text style={styles.free}>Gratuit</Text>
          )}
        </View>
      </View>

      {/* Trajet : timeline + lieux/heures, date en bas à droite */}
      <View style={styles.tripRow}>
        {/* Timeline verticale */}
        <View style={styles.timeline}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>

        <View style={styles.stops}>
          <View style={styles.stop}>
            <Text style={styles.stopLabel}>Départ - {trip.departureTime}</Text>
            <Text style={styles.stopPlace}>{trip.departurePlace}</Text>
          </View>
          <View style={styles.stop}>
            <Text style={styles.stopLabel}>Arrivée - {trip.arrivalTime}</Text>
            <Text style={styles.stopPlace}>{trip.arrivalPlace}</Text>
          </View>
        </View>

        <Text style={styles.date}>{trip.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tripCardBg,
    borderRadius: 10,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    marginLeft: 15,
    gap: 2,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    borderRadius: 25,
  },
  badgeDriver: {
    backgroundColor: colors.badgeDriverBg,
  },
  badgeWalk: {
    backgroundColor: colors.badgeWalkBg,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 20,
  },
  badgeDriverText: {
    color: colors.badgeDriverText,
  },
  badgeWalkText: {
    color: '#ffffff',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  paid: {
    color: colors.onDarkMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  free: {
    color: colors.walkGreen,
    fontSize: 16,
    lineHeight: 24,
  },
  tripRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  timeline: {
    width: 16,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ffffff',
  },
  line: {
    width: 1,
    flex: 1,
    minHeight: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 4,
  },
  stops: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  stop: {
    gap: 2,
  },
  stopLabel: {
    color: '#ffffff',
    fontSize: 8,
    lineHeight: 12,
  },
  stopPlace: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  date: {
    color: colors.onDarkMuted,
    fontSize: 16,
    lineHeight: 24,
    alignSelf: 'flex-end',
    marginLeft: 8,
  },
});
