import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createBooking, fetchMatching } from '../api/rides';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Companion, CompanionCard } from '../components/CompanionCard';
import { goToTab } from '../navigation/helpers';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { RouteCard } from '../components/RouteCard';

// Repli (Figma 23:2122) si l'API n'est pas joignable — mode démonstration.
const FALLBACK: Companion[] = [
  { id: '1', name: 'Lia Presko', rating: '4.8', time: '1 min', distance: '40m' },
  { id: '2', name: 'Laure Peri', rating: '5', time: '6 min', distance: '420m' },
  { id: '3', name: 'Marie Benet', rating: '4.9', time: '3 min', distance: '240m' },
];

/**
 * Écran "Trouver une accompagnatrice" (Figma 23:2122).
 * Charge les accompagnatrices via GET /matching (note moyenne réelle) ; la
 * sélection crée la réservation (POST /bookings) puis ouvre le suivi (Tracking).
 */
export function MatchingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Matching'>>();
  const { rideRef, startPoint, endPoint } = route.params;

  const [companions, setCompanions] = useState<Companion[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchMatching('solidaire')
      .then((actors) => {
        if (!active) return;
        setCompanions(
          actors.map((a) => ({
            id: String(a.userId),
            userId: a.userId,
            name: a.name,
            rating: a.rating,
            time: a.time,
            distance: a.distance,
          }))
        );
      })
      .catch(() => active && setCompanions(FALLBACK))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function select(c: Companion) {
    if (booking || !c.userId) {
      // Sans userId (données de repli), on ne peut pas réserver côté API.
      if (!c.userId) navigation.navigate('Tracking', { name: c.name, startPoint, endPoint });
      return;
    }
    setBooking(c.userId);
    try {
      await createBooking({ rideRef, actorId: c.userId, mode: 'solidaire', price: 0 });
      navigation.navigate('Tracking', { rideRef, name: c.name, startPoint, endPoint });
    } catch {
      Alert.alert('Erreur', "La réservation a échoué. Réessayez.");
    } finally {
      setBooking(null);
    }
  }

  return (
    <View style={styles.root}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre */}
        <View style={styles.titleRow}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={26} color={colors.navy} />
          </Pressable>
          <Text style={styles.pageTitle}>Trouver une accompagnatrice</Text>
        </View>

        {/* Carte itinéraire (réelle, transmise depuis Booking) */}
        <View style={styles.routeWrap}>
          <RouteCard position={startPoint} destination={endPoint} />
        </View>

        {/* Liste à proximité */}
        <Text style={styles.sectionTitle}>À proximité</Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {companions.map((c) => (
              <CompanionCard
                key={c.id}
                companion={c}
                onSelect={() => select(c)}
                loading={booking === c.userId}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav active="Trajets" onNavigate={(tab) => goToTab(navigation, tab)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.65,
  },
  routeWrap: {
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  loader: {
    marginTop: 24,
  },
  list: {
    gap: 12,
  },
});
