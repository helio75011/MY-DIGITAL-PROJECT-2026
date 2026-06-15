import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { acceptRequest, fetchRequests, type RideRequest } from '../api/actor';
import { AppHeader } from '../components/AppHeader';
import { colors } from '../theme/colors';

/**
 * Écran "Courses disponibles" (onglet acteur). Liste les trajets en recherche ;
 * l'acteur en accepte un -> il devient en charge du trajet (status ongoing).
 */
export function ActorRequestsScreen() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  // Recharge à chaque fois que l'onglet reprend le focus.
  useFocusEffect(useCallback(() => load(), [load]));

  async function accept(r: RideRequest) {
    if (accepting) return;
    setAccepting(r.rideRef);
    try {
      await acceptRequest(r.rideRef);
      setRequests((prev) => prev.filter((x) => x.rideRef !== r.rideRef));
      Alert.alert('Course acceptée', `Vous accompagnez ${r.passenger}.`);
    } catch {
      Alert.alert('Indisponible', 'Cette course vient d\'être prise ou annulée.');
      load();
    } finally {
      setAccepting(null);
    }
  }

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Courses disponibles</Text>
        <Text style={styles.subtitle}>Acceptez une demande pour accompagner une passagère.</Text>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 32 }} />
        ) : requests.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.mutedText} />
            <Text style={styles.emptyText}>Aucune demande pour l'instant.</Text>
            <Pressable onPress={load}>
              <Text style={styles.refresh}>Actualiser</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {requests.map((r) => (
              <View key={r.rideRef} style={styles.card}>
                <Text style={styles.passenger}>{r.passenger}</Text>
                <View style={styles.routeRow}>
                  <Feather name="circle" size={12} color={colors.primary} />
                  <Text style={styles.place}>{r.startPoint}</Text>
                </View>
                <View style={styles.routeRow}>
                  <Feather name="map-pin" size={12} color={colors.driverRed} />
                  <Text style={styles.place}>{r.endPoint}</Text>
                </View>
                {r.distance ? (
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="map-marker-distance" size={13} color={colors.metaText} />
                    <Text style={styles.meta}>{r.distance} km</Text>
                  </View>
                ) : null}
                <Pressable
                  style={styles.acceptBtn}
                  onPress={() => accept(r)}
                  disabled={accepting === r.rideRef}
                >
                  {accepting === r.rideRef ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.acceptText}>Accepter la course</Text>
                  )}
                </Pressable>
              </View>
            ))}
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
  empty: { alignItems: 'center', marginTop: 48, gap: 10 },
  emptyText: { color: colors.bodyText, fontSize: 14 },
  refresh: { color: colors.primary, fontSize: 14, fontWeight: '600', marginTop: 4 },
  list: { gap: 14 },
  card: {
    backgroundColor: colors.menuCardBg,
    borderRadius: 12,
    padding: 18,
    gap: 8,
  },
  passenger: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  place: { color: '#ffffff', fontSize: 14, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  meta: { color: colors.onDarkMuted, fontSize: 12 },
  acceptBtn: {
    backgroundColor: colors.statusGreen,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  acceptText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
