import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { assessCorridor, corridorColor, type CorridorAssessment } from '../api/corridor';
import { getCurrentPosition, type GeoPoint } from '../api/location';
import { fetchSafeZones, zoneColor, type SafeZone } from '../api/zones';
import { AppHeader } from '../components/AppHeader';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const LEVEL_LABEL: Record<number, string> = {
  3: 'Très sûre',
  2: 'Correcte',
  1: 'Vigilance',
};

/**
 * Carte des zones sûres / bien éclairées (Could-Have "zones éclairées").
 * Affiche les zones du référentiel (GET /safe-zones) en cercles colorés selon
 * leur niveau de sûreté. Aide la passagère à choisir un trajet rassurant.
 */
export function SafeZonesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [corridor, setCorridor] = useState<CorridorAssessment | null>(null);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    fetchSafeZones()
      .then((z) =>
        // mysql2 renvoie les DECIMAL en string : on normalise en number.
        setZones(z.map((x) => ({ ...x, latitude: Number(x.latitude), longitude: Number(x.longitude) })))
      )
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
    // Position de départ pour évaluer le corridor vers une zone.
    getCurrentPosition().then(setOrigin).catch(() => setOrigin(null));
  }, []);

  // Tap sur une zone : "IA Corridor" évalue la sûreté du trajet depuis ma position.
  async function assess(z: SafeZone) {
    if (!origin) return;
    setAssessing(true);
    try {
      const res = await assessCorridor({
        startLat: origin.latitude,
        startLng: origin.longitude,
        endLat: z.latitude,
        endLng: z.longitude,
      });
      setCorridor(res);
    } catch {
      setCorridor(null);
    } finally {
      setAssessing(false);
    }
  }

  // Région initiale : centrée sur la 1re zone, ou Paris par défaut.
  const region = {
    latitude: zones[0]?.latitude ?? 48.8566,
    longitude: zones[0]?.longitude ?? 2.3522,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <View style={styles.titleRow}>
        <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={26} color={colors.navy} />
        </Pressable>
        <Text style={styles.pageTitle}>Zones sûres</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.navy} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.mapWrap}>
          <MapView style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={region}>
            {zones.map((z) => (
              <React.Fragment key={z.id}>
                <Circle
                  center={{ latitude: z.latitude, longitude: z.longitude }}
                  radius={300}
                  strokeColor={zoneColor(z.level)}
                  fillColor={`${zoneColor(z.level)}33`}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: z.latitude, longitude: z.longitude }}
                  title={z.name}
                  description={`${LEVEL_LABEL[z.level] ?? ''}${z.city ? ' · ' + z.city : ''} — appuyez pour évaluer le trajet`}
                  pinColor={zoneColor(z.level)}
                  onCalloutPress={() => assess(z)}
                />
              </React.Fragment>
            ))}
          </MapView>

          {/* Légende */}
          <View style={styles.legend}>
            {[3, 2, 1].map((lvl) => (
              <View key={lvl} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: zoneColor(lvl) }]} />
                <Text style={styles.legendText}>{LEVEL_LABEL[lvl]}</Text>
              </View>
            ))}
          </View>

          {/* Bannière "IA Corridor" : score de sûreté du trajet évalué */}
          {assessing ? (
            <View style={styles.corridor}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.corridorLabel}>Évaluation du trajet…</Text>
            </View>
          ) : corridor ? (
            <View style={[styles.corridor, { borderLeftColor: corridorColor(corridor.level) }]}>
              <View style={styles.corridorTop}>
                <Feather name="shield" size={18} color={corridorColor(corridor.level)} />
                <Text style={[styles.corridorScore, { color: corridorColor(corridor.level) }]}>
                  Sécurité {corridor.score}/100
                </Text>
                <Text style={styles.corridorDist}>{corridor.distanceKm} km</Text>
              </View>
              <Text style={styles.corridorLabel}>{corridor.label}</Text>
              {corridor.safeZonesOnPath.length > 0 ? (
                <Text style={styles.corridorZones}>
                  Jalonné par : {corridor.safeZonesOnPath.map((z) => z.name).join(', ')}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: colors.navy, fontWeight: '600' },
  corridor: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 14,
    gap: 6,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  corridorTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  corridorScore: { flex: 1, fontSize: 15, fontWeight: '800' },
  corridorDist: { fontSize: 12, color: colors.bodyText, fontWeight: '600' },
  corridorLabel: { fontSize: 13, color: colors.navy },
  corridorZones: { fontSize: 11, color: colors.bodyText },
});
