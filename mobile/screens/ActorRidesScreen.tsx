import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchActorRides, type ActorRide } from '../api/actor';
import { AppHeader } from '../components/AppHeader';
import { colors } from '../theme/colors';

const STATUS_LABEL: Record<string, string> = {
  ongoing: 'En cours',
  searching: 'En recherche',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/** Écran "Mes trajets" (onglet acteur) : courses prises en charge. */
export function ActorRidesScreen() {
  const [rides, setRides] = useState<ActorRide[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchActorRides()
      .then(setRides)
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => load(), [load]));

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Mes trajets</Text>
        <Text style={styles.subtitle}>Vos courses en cours et passées.</Text>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 32 }} />
        ) : rides.length === 0 ? (
          <Text style={styles.empty}>Aucun trajet pour l'instant.</Text>
        ) : (
          <View style={styles.list}>
            {rides.map((r) => {
              const ongoing = r.status === 'ongoing';
              return (
                <View key={r.rideRef} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.passenger}>{r.passenger}</Text>
                    <View style={[styles.badge, ongoing ? styles.badgeOngoing : styles.badgeDone]}>
                      <Text style={styles.badgeText}>{STATUS_LABEL[r.status] ?? r.status}</Text>
                    </View>
                  </View>
                  <View style={styles.routeRow}>
                    <Feather name="circle" size={11} color={colors.primary} />
                    <Text style={styles.place}>{r.startPoint}</Text>
                  </View>
                  <View style={styles.routeRow}>
                    <Feather name="map-pin" size={11} color={colors.driverRed} />
                    <Text style={styles.place}>{r.endPoint}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.bodyText, marginTop: 6, marginBottom: 20 },
  empty: { color: colors.bodyText, fontSize: 14, fontStyle: 'italic', marginTop: 24 },
  list: { gap: 12 },
  card: { backgroundColor: colors.menuCardBg, borderRadius: 12, padding: 18, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  passenger: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeOngoing: { backgroundColor: colors.statusGreen },
  badgeDone: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  place: { color: '#ffffff', fontSize: 14, flex: 1 },
});
