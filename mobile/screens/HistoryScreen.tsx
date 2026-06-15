import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchRideHistory, fetchUpcoming, type UpcomingRide } from '../api/rides';
import { AppHeader } from '../components/AppHeader';
import { Trip, TripCard } from '../components/TripCard';
import { colors } from '../theme/colors';

// Filtres de la barre du haut (Figma 23:1435).
const FILTERS = ['Tout', 'Link & Walk', 'Premium'] as const;
type Filter = (typeof FILTERS)[number];

// Données de repli (maquette Figma 23:1310) si l'API n'est pas joignable.
const FALLBACK_TRIPS: Trip[] = [
  { id: '1', name: 'Alice B.', kind: 'driver', price: '24,50€', date: '16/03/26', departurePlace: 'Gare de Lyon, Paris', departureTime: '21H45', arrivalPlace: 'Rue de la Roquette, 11e', arrivalTime: '22H15' },
  { id: '2', name: 'Julie F.', kind: 'walk', date: '07/03/26', departurePlace: 'Bibliothèque François Mitterrand', departureTime: '22h37', arrivalPlace: "Place d'Italie, Paris", arrivalTime: '23h01' },
  { id: '3', name: 'Lisa I.', kind: 'walk', date: '21/02/26', departurePlace: 'La Défense', departureTime: '21h00', arrivalPlace: 'Gare de Lyon', arrivalTime: '21h30' },
  { id: '4', name: 'Jeanne F.', kind: 'walk', date: '09/02/26', departurePlace: 'Châtelet les Halles', departureTime: '21H45', arrivalPlace: 'Nanterre Université', arrivalTime: '22H15' },
  { id: '5', name: 'Aurélie H.', kind: 'driver', price: '13,50€', date: '28/01/26', departurePlace: 'St Ouen', departureTime: '21H45', arrivalPlace: 'Rue de la Roquette, 11e', arrivalTime: '22H15' },
  { id: '6', name: 'Lola T.', kind: 'driver', price: '32,00€', date: '16/03/26', departurePlace: 'Gonesse', departureTime: '21H45', arrivalPlace: 'Rue de la Roquette, 11e', arrivalTime: '22H15' },
  { id: '7', name: 'Sirine D.', kind: 'driver', price: '20,50€', date: '16/03/26', departurePlace: 'Parc des Princes', departureTime: '21H45', arrivalPlace: 'Rue de la Roquette, 11e', arrivalTime: '22H15' },
  { id: '8', name: 'Alya B.', kind: 'walk', date: '16/03/26', departurePlace: "Place de l'Etoile", departureTime: '21H45', arrivalPlace: 'La Défense', arrivalTime: '22H15' },
];

/**
 * Écran Historique des trajets (Figma 23:1310).
 * Charge les trajets depuis l'API (GET /rides/history) ; en cas d'erreur
 * réseau, retombe sur les données de la maquette (FALLBACK_TRIPS).
 */
export function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('Tout');
  const [allTrips, setAllTrips] = useState<Trip[]>(FALLBACK_TRIPS);
  const [upcoming, setUpcoming] = useState<UpcomingRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  // Recharge les trajets planifiés à chaque fois que l'onglet reprend le focus
  // (ex. après avoir planifié un trajet depuis l'écran Réserver).
  useFocusEffect(
    useCallback(() => {
      fetchUpcoming()
        .then(setUpcoming)
        .catch(() => setUpcoming([]));
    }, [])
  );

  useEffect(() => {
    let active = true;
    fetchRideHistory()
      .then((trips) => {
        if (!active) return;
        setAllTrips(trips);
        setOffline(false);
      })
      .catch(() => {
        if (!active) return;
        setAllTrips(FALLBACK_TRIPS); // repli hors-ligne
        setOffline(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const trips = allTrips.filter((t) => {
    if (filter === 'Link & Walk') return t.kind === 'walk';
    if (filter === 'Premium') return t.kind === 'driver';
    return true;
  });

  return (
    <View style={styles.root}>
      <AppHeader />

      {/* Liste des trajets */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête de page (onglet : pas de retour) */}
        <Text style={styles.bigTitle}>Mon historique de trajet</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Historique</Text>
        </View>
        <Text style={styles.subtitle}>Retrouvez vos trajets et vos chauffeurs.</Text>
        {offline ? (
          <Text style={styles.offline}>Mode hors-ligne (données de démonstration)</Text>
        ) : null}

        {/* Section "À venir" : trajets planifiés à l'avance */}
        {upcoming.length > 0 ? (
          <View style={styles.upcomingBlock}>
            <Text style={styles.upcomingTitle}>À VENIR</Text>
            {upcoming.map((u) => (
              <View key={u.id} style={styles.upcomingCard}>
                <View style={styles.upcomingWhen}>
                  <Feather name="calendar" size={16} color="#ffffff" />
                  <Text style={styles.upcomingDate}>{u.date} · {u.time}</Text>
                </View>
                <Text style={styles.upcomingRoute} numberOfLines={1}>
                  {u.departurePlace} → {u.arrivalPlace}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Barre de filtres */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Cartes (ou indicateur de chargement) */}
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : (
          trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  list: {
    paddingHorizontal: 27,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 17,
  },
  bigTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
  },
  subtitle: {
    fontSize: 14,
    color: colors.bodyText,
    marginTop: 2,
  },
  offline: {
    fontSize: 12,
    color: colors.bodyText,
    fontStyle: 'italic',
    marginTop: 2,
  },
  loader: {
    marginTop: 24,
  },
  upcomingBlock: {
    marginTop: 12,
    gap: 8,
  },
  upcomingTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.bodyText,
    marginBottom: 2,
  },
  upcomingCard: {
    backgroundColor: colors.statusGreen,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  upcomingWhen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingDate: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  upcomingRoute: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  filters: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 43,
  },
  chipActive: {
    backgroundColor: colors.filterActiveBg,
  },
  chipInactive: {
    backgroundColor: colors.filterInactiveBg,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 24,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: colors.filterInactiveText,
  },
});
