import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getCurrentPosition, haversineKm, type GeoPoint } from '../api/location';
import { createRide, type RideMode } from '../api/rides';
import { AppHeader } from '../components/AppHeader';
import { ModeCard } from '../components/ModeCard';
import { colors } from '../theme/colors';
import { goToTab } from '../navigation/helpers';
import type { RootStackParamList } from '../navigation/types';

// Format lisible "lun. 20 juin · 22:30" pour un créneau planifié.
function formatSchedule(d: Date): string {
  const date = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

/**
 * Écran "Réserver un trajet" (onglet "Trajets", Figma 23:2060).
 * Récupère la position GPS réelle (expo-location), laisse saisir la destination,
 * crée un trajet (POST /rides) puis ouvre Matching (solidaire) ou Driver (premium)
 * avec la référence du trajet.
 */
export function BookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [destination, setDestination] = useState('');
  const [locating, setLocating] = useState(true);
  const [submitting, setSubmitting] = useState<RideMode | null>(null);
  // Planification : null = trajet immédiat ; une date = trajet planifié.
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // Tente de récupérer la position GPS et de remplir le champ de départ.
  async function locate() {
    setLocating(true);
    try {
      const p = await getCurrentPosition();
      setOrigin(p);
      setOriginLabel(p.label);
    } catch {
      // Permission refusée ou GPS indisponible : on laisse l'utilisatrice saisir.
      setOrigin(null);
    } finally {
      setLocating(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await locate();
    })();
    return () => {
      active = false;
    };
  }, []);

  async function startRide(mode: RideMode) {
    if (submitting) return;
    if (locating) {
      Alert.alert('Position', 'Localisation en cours, patientez un instant.');
      return;
    }
    if (!originLabel.trim()) {
      Alert.alert('Départ', 'Indiquez votre point de départ.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Destination', 'Indiquez votre destination.');
      return;
    }

    setSubmitting(mode);
    try {
      // Distance estimée si on a un point d'origine GPS (sinon laissée vide).
      const distanceKm = origin ? haversineKm(origin, { ...origin, label: '' }) : undefined;
      const { rideRef } = await createRide({
        startPoint: originLabel,
        endPoint: destination.trim(),
        distanceKm,
      });
      const params = { rideRef, mode, startPoint: originLabel, endPoint: destination.trim() };
      navigation.navigate(mode === 'solidaire' ? 'Matching' : 'Driver', params);
    } catch {
      Alert.alert('Erreur', "Impossible de créer le trajet. Réessayez.");
    } finally {
      setSubmitting(null);
    }
  }

  // Crée un trajet planifié (pas de matching immédiat) puis renvoie à l'historique.
  async function schedule() {
    if (scheduling || !scheduledAt) return;
    if (!originLabel.trim() || !destination.trim()) {
      Alert.alert('Trajet incomplet', 'Indiquez le départ et la destination.');
      return;
    }
    setScheduling(true);
    try {
      await createRide({
        startPoint: originLabel,
        endPoint: destination.trim(),
        distanceKm: origin ? haversineKm(origin, { ...origin, label: '' }) : undefined,
        scheduledAt: scheduledAt.toISOString(),
      });
      Alert.alert('Trajet planifié', `Réservé pour le ${formatSchedule(scheduledAt)}.`);
      setScheduledAt(null);
      goToTab(navigation, 'Historique');
    } catch {
      Alert.alert('Erreur', 'Impossible de planifier le trajet. Réessayez.');
    } finally {
      setScheduling(false);
    }
  }

  function onPickerChange(event: { type: string }, selected?: Date) {
    setShowPicker(false);
    if (event.type === 'set' && selected) {
      if (selected.getTime() < Date.now()) {
        Alert.alert('Date invalide', 'Choisissez une date et une heure futures.');
        return;
      }
      setScheduledAt(selected);
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
          <Text style={styles.pageTitle}>Réserver un trajet</Text>
        </View>

        {/* Itinéraire : position GPS réelle + destination saisie (Figma 23:2065) */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Feather name="crosshair" size={20} color={colors.routeValue} />
            <View style={styles.routeField}>
              <Text style={styles.routeLabel}>MA POSITION</Text>
              {locating ? (
                <ActivityIndicator size="small" color={colors.routeLabel} style={styles.routeLoader} />
              ) : (
                <TextInput
                  style={styles.routeInput}
                  value={originLabel}
                  onChangeText={setOriginLabel}
                  placeholder="Votre point de départ"
                  placeholderTextColor={colors.placeholder}
                />
              )}
            </View>
            {/* Relancer la géolocalisation */}
            <Pressable hitSlop={8} onPress={locate} disabled={locating}>
              <Feather name="navigation" size={18} color={colors.routeLabel} />
            </Pressable>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <Ionicons name="location-sharp" size={20} color={colors.routeValue} />
            <View style={styles.routeField}>
              <Text style={styles.routeLabel}>DESTINATION</Text>
              <TextInput
                style={styles.routeInput}
                value={destination}
                onChangeText={setDestination}
                placeholder="Où allez-vous ?"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        </View>

        {/* Planification : départ immédiat ou créneau futur */}
        <Pressable style={styles.scheduleRow} onPress={() => setShowPicker(true)}>
          <Feather name="calendar" size={18} color={colors.primary} />
          <Text style={styles.scheduleText}>
            {scheduledAt ? formatSchedule(scheduledAt) : 'Planifier pour plus tard'}
          </Text>
          {scheduledAt ? (
            <Pressable hitSlop={8} onPress={() => setScheduledAt(null)}>
              <Feather name="x" size={18} color={colors.bodyText} />
            </Pressable>
          ) : (
            <Feather name="chevron-right" size={18} color={colors.bodyText} />
          )}
        </Pressable>

        {showPicker ? (
          <DateTimePicker
            value={scheduledAt ?? new Date(Date.now() + 3600_000)}
            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
            minimumDate={new Date()}
            onChange={onPickerChange}
          />
        ) : null}

        {scheduledAt ? (
          /* Trajet planifié : confirmation (pas de matching immédiat) */
          <Pressable
            style={[styles.confirmScheduleBtn, scheduling && styles.btnDisabled]}
            onPress={schedule}
            disabled={scheduling}
          >
            {scheduling ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.confirmScheduleText}>Confirmer la réservation</Text>
            )}
          </Pressable>
        ) : (
          <>
            {/* Modes de trajet (départ immédiat) */}
            <Text style={styles.sectionTitle}>Choisir votre mode de trajet</Text>
            <View style={styles.modes}>
              <ModeCard
                variant="solidaire"
                title="Accompagnement Solidaire"
                description="Profils vérifiés, femme à femme. Idéal pour les trajets quotidiens."
                eta="21 min"
                onPress={() => startRide('solidaire')}
                loading={submitting === 'solidaire'}
              />
              <ModeCard
                variant="premium"
                title="Chauffeur Premium"
                description="Agent certifié avec véhicule de veille. Protection maximale immédiate."
                eta="12 min"
                price="15,00€"
                onPress={() => startRide('premium')}
                loading={submitting === 'premium'}
              />
            </View>
          </>
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
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.75,
  },
  routeCard: {
    marginTop: 20,
    backgroundColor: colors.routeFieldBg, // gris clair #eeeef0 (Figma 23:2066)
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  routeField: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.routeLabel, // violet #6d4ea2
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  routeInput: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.routeValue, // #1a1c1d (texte saisi visible)
    paddingVertical: 2,
  },
  routeLoader: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  routeDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginLeft: 30,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 16,
  },
  modes: {
    gap: 20,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    backgroundColor: colors.routeFieldBg,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  scheduleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  confirmScheduleBtn: {
    backgroundColor: colors.statusGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  confirmScheduleText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
