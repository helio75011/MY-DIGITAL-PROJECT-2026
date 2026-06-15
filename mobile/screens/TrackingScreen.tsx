import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Battery from 'expo-battery';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { sendEmergencySms } from '../api/contacts';
import { completeRide, reportIncident, sendTrackPoint } from '../api/tracking';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { RatingModal } from '../components/RatingModal';
import { goToTab } from '../navigation/helpers';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const trackingMap = require('../assets/tracking-map.png');
const POLL_MS = 3000; // intervalle d'envoi de position (suivi "temps réel")

type Props = {
  /** Libellé de statut, ex. "Marche en groupe active" ou "Trajet Premium". */
  status?: string;
  eta?: string;
  /** Progression du trajet (0–100). */
  progress?: number;
  /** Accompagnatrice / chauffeur. */
  name?: string;
  role?: string;
  rating?: string;
  /** Distance affichée ; omise pour la variante Premium. */
  distance?: string;
};

/**
 * Écran de suivi de trajet en cours (Figma 23:2512, variante Premium 23:2642).
 * Si un `rideRef` est passé en params : envoie la position GPS toutes les ~3 s
 * (POST /rides/:ref/track), fait avancer la progression, et branche les actions
 * Partager (feuille native), Appeler et SOS (POST /incidents).
 */
export function TrackingScreen({
  status = 'Marche en groupe active',
  eta = 'Arrivée dans 5 mins',
  progress: progressProp = 75,
  name = 'Lia Presko',
  role = 'Accompagnatrice',
  rating = '4.8',
  distance = '40m',
}: Props = {}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Tracking'>>();
  const rideRef = route.params?.rideRef;
  // Les données réelles transmises par le flux (params) priment sur les valeurs
  // par défaut passées en props (utilisées par le wrapper Premium / la démo).
  const displayName = route.params?.name ?? name;

  const [progress, setProgress] = useState(rideRef ? 0 : progressProp);
  const [sosVisible, setSosVisible] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [lowBattery, setLowBattery] = useState(false);
  const lastPos = useRef<{ latitude: number; longitude: number } | null>(null);

  // Mode batterie faible : surveille le niveau et alerte sous 20 %.
  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        setLowBattery(level >= 0 && level <= 0.2);
        sub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
          setLowBattery(batteryLevel >= 0 && batteryLevel <= 0.2);
        });
      } catch {
        /* batterie indisponible (ex. émulateur) */
      }
    })();
    return () => sub?.remove();
  }, []);

  async function sendBatterySms() {
    await sendEmergencySms(
      `🔋 Ma batterie est faible. Je suis en trajet SafeWalk avec ${displayName}, voici ma position en cas de coupure.`,
      lastPos.current ?? undefined
    ).catch(() => {});
  }

  // Suivi temps réel : envoie la position GPS périodiquement tant que le trajet
  // est en cours, et fait progresser la barre jusqu'à l'arrivée.
  useEffect(() => {
    if (!rideRef) return;
    let active = true;
    let timer: ReturnType<typeof setInterval>;

    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      const canLocate = perm === 'granted';

      // Premier point = départ.
      if (canLocate) {
        try {
          const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lastPos.current = { latitude: p.coords.latitude, longitude: p.coords.longitude };
          await sendTrackPoint(rideRef, p.coords.latitude, p.coords.longitude, 'DEPARTURE');
        } catch {
          // position indisponible : on continue avec la progression simulée
        }
      }

      timer = setInterval(async () => {
        if (!active) return;
        // Avance la progression (≈ 1 min de trajet simulé par tick).
        setProgress((prev) => Math.min(100, prev + 8));

        if (canLocate) {
          try {
            const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            lastPos.current = { latitude: p.coords.latitude, longitude: p.coords.longitude };
            await sendTrackPoint(rideRef, p.coords.latitude, p.coords.longitude, 'POSITION');
          } catch {
            /* ignore un tick raté */
          }
        }
      }, POLL_MS);
    })();

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [rideRef]);

  // À l'arrivée (100 %), clôt le trajet une seule fois puis propose la notation.
  const completed = useRef(false);
  useEffect(() => {
    if (rideRef && progress >= 100 && !completed.current) {
      completed.current = true;
      completeRide(rideRef, lastPos.current ?? undefined).catch(() => {});
      setRatingVisible(true);
    }
  }, [progress, rideRef]);

  async function handleShare() {
    const where = route.params?.endPoint ? ` vers ${route.params.endPoint}` : '';
    try {
      await Share.share({
        message: `Je suis en trajet Link & Walk${where} avec ${displayName}. Suis mon trajet en direct${rideRef ? ` (réf ${rideRef})` : ''}.`,
      });
    } catch {
      /* partage annulé */
    }
  }

  function handleCall() {
    Linking.openURL('tel:0612345678').catch(() => {});
  }

  async function handleSos() {
    if (sosSending) return;
    setSosSending(true);
    try {
      // 1) Trace l'incident côté serveur (dashboard admin).
      await reportIncident({
        rideRef,
        type: 'SOS',
        latitude: lastPos.current?.latitude,
        longitude: lastPos.current?.longitude,
      });
    } catch {
      /* l'intention d'alerte prime même en cas d'échec réseau */
    }
    // 2) Prévient les contacts d'urgence par SMS (position incluse).
    try {
      await sendEmergencySms(
        `🚨 ALERTE SafeWalk : j'ai déclenché un SOS pendant mon trajet avec ${displayName}.`,
        lastPos.current ?? undefined
      );
    } catch {
      /* SMS indisponible : la modale confirme quand même l'alerte serveur */
    }
    setSosVisible(true);
    setSosSending(false);
  }

  const liveEta = rideRef
    ? progress >= 100
      ? 'Arrivée'
      : `Arrivée dans ${Math.max(1, Math.round((100 - progress) / 8))} min`
    : eta;

  return (
    <View style={styles.root}>
      {/* Map plein écran */}
      <ImageBackground source={trackingMap} style={styles.map} resizeMode="cover" />

      <AppHeader />

      {/* Carte de statut + progression */}
      <View style={styles.statusCard}>
        <View style={styles.statusTop}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <Text style={styles.statusEta}>{liveEta}</Text>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.navy, colors.statCardBg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>DÉPART</Text>
          <Text style={styles.progressLabel}>ARRIVÉE</Text>
        </View>
        <Text style={styles.progressPercent}>{Math.round(progress)}% Complétée</Text>
      </View>

      {/* Bannière mode batterie faible */}
      {lowBattery ? (
        <View style={styles.batteryBanner}>
          <Feather name="battery" size={18} color={colors.sosRed} />
          <Text style={styles.batteryText}>Batterie faible — sécurisez votre trajet</Text>
          <Pressable style={styles.batteryBtn} onPress={sendBatterySms}>
            <Text style={styles.batteryBtnText}>Envoyer ma position</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Boutons d'action + carte accompagnatrice, ancrés en bas */}
      <View style={styles.bottomBlock}>
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Feather name="share-2" size={22} color={colors.navy} />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleCall}>
            <Feather name="phone" size={22} color={colors.navy} />
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.sosBtn]}
            onPress={handleSos}
            disabled={sosSending}
          >
            <Text style={styles.sosText}>{sosSending ? '…' : 'S.O.S'}</Text>
          </Pressable>
        </View>

        <View style={styles.companionCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={colors.navy} />
            </View>
            <View style={styles.availableDot}>
              <Feather name="check" size={9} color={colors.navy} />
            </View>
          </View>
          <View style={styles.companionInfo}>
            <Text style={styles.companionName}>{displayName}</Text>
            <Text style={styles.companionRole}>{role}</Text>
            {distance ? (
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="map-marker-distance" size={12} color={colors.metaText} />
                <Text style={styles.meta}>{distance}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.rating}>
            <FontAwesome name="heart" size={13} color={colors.heartRed} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>

      {/* Barre de navigation inférieure (ancrée au-dessus de la map) */}
      <View style={styles.bottomNavWrap}>
        <BottomNav active="Trajets" onNavigate={(tab) => goToTab(navigation, tab)} />
      </View>

      {/* Modale de confirmation SOS */}
      <Modal visible={sosVisible} transparent animationType="fade" onRequestClose={() => setSosVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Feather name="alert-triangle" size={32} color={colors.sosRed} />
            </View>
            <Text style={styles.modalTitle}>Alerte SOS envoyée</Text>
            <Text style={styles.modalText}>
              Votre position a été transmise. L'équipe de sécurité Link & Walk a été alertée
              et va vous contacter.
            </Text>
            <Pressable style={styles.modalBtn} onPress={() => setSosVisible(false)}>
              <Text style={styles.modalBtnText}>J'ai compris</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Notation post-trajet (à la clôture, 100 %) */}
      <RatingModal
        visible={ratingVisible}
        ratedId={route.params?.actorId ?? null}
        name={displayName}
        onClose={() => setRatingVisible(false)}
        onDone={() => goToTab(navigation, 'Historique')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Carte de statut
  statusCard: {
    position: 'absolute',
    top: 103,
    left: 27,
    right: 27,
    height: 127,
    backgroundColor: colors.statusCardBg,
    borderRadius: 10,
    paddingHorizontal: 21,
    paddingTop: 16,
  },
  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.statusGreen,
  },
  statusText: {
    flex: 1,
    color: colors.statusGreen,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  statusEta: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    width: 113,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: 8,
    borderRadius: 9999,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    color: colors.progressLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressPercent: {
    color: colors.progressLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 1,
  },
  // Bannière batterie faible
  batteryBanner: {
    position: 'absolute',
    top: 240,
    left: 27,
    right: 27,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.sosBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  batteryText: {
    flex: 1,
    color: colors.sosRed,
    fontSize: 12,
    fontWeight: '600',
  },
  batteryBtn: {
    backgroundColor: colors.sosRed,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  batteryBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  // Bloc bas
  bottomBlock: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 120,
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
    paddingLeft: 31,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sosBtn: {
    backgroundColor: colors.sosBg,
    shadowColor: colors.sosRed,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sosText: {
    color: colors.sosRed,
    fontSize: 14,
    fontWeight: '500',
  },
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.trackingCardBg,
    borderRadius: 10,
    padding: 19,
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
  companionInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  companionName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  companionRole: {
    color: colors.metaText,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    color: colors.metaText,
    fontSize: 16,
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
  // Bottom nav ancrée au-dessus de la map
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Modale SOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sosBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.sosRed,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: colors.bodyText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
