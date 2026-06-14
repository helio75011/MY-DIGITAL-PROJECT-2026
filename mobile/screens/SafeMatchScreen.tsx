import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmSafeMatch, fetchSafeMatch, SAFEMATCH_COLORS } from '../api/safematch';
import { Logo } from '../components/Logo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

/**
 * Écran SafeMatch : code de validation à l'embarquement (couleur + 4 chiffres).
 * La passagère vérifie que l'accompagnatrice/le chauffeur annonce le bon code
 * avant de monter, puis confirme — le suivi du trajet démarre alors.
 */
export function SafeMatchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SafeMatch'>>();
  const { rideRef, actorId, name, startPoint, endPoint, premium } = route.params;

  const [color, setColor] = useState(route.params.color ?? '');
  const [digits, setDigits] = useState(route.params.digits ?? '');
  const [loading, setLoading] = useState(!route.params.color);
  const [confirming, setConfirming] = useState(false);

  // Récupère le code si non transmis (ex. accès direct).
  useEffect(() => {
    if (route.params.color) return;
    let active = true;
    fetchSafeMatch(rideRef)
      .then((c) => {
        if (!active) return;
        setColor(c.color);
        setDigits(c.digits);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [rideRef]);

  async function confirm() {
    if (confirming) return;
    setConfirming(true);
    try {
      await confirmSafeMatch(rideRef);
    } catch {
      // Même si la confirmation réseau échoue, on laisse démarrer le suivi.
    } finally {
      setConfirming(false);
    }
    const params = { rideRef, actorId, name, startPoint, endPoint };
    navigation.replace(premium ? 'TrackingPremium' : 'Tracking', params);
  }

  function reportMismatch() {
    Alert.alert(
      'Code incorrect',
      "Si la personne n'annonce pas ce code, NE MONTEZ PAS. Contactez le support et réessayez une autre mise en relation.",
      [{ text: 'Compris' }]
    );
  }

  const display = SAFEMATCH_COLORS[color] ?? colors.primary;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo size={56} />
          <Text style={styles.brand}>Link & walk</Text>
        </View>

        <Text style={styles.title}>Vérification SafeMatch</Text>
        <Text style={styles.subtitle}>
          Avant de monter, vérifiez que {name} vous annonce bien ce code. C'est votre
          garantie de monter avec la bonne personne.
        </Text>

        {/* Carte du code */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 60 }} />
        ) : (
          <View style={[styles.codeCard, { backgroundColor: display }]}>
            <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
            <Text style={styles.codeColor}>{color}</Text>
            <Text style={styles.codeDigits}>{digits}</Text>
          </View>
        )}

        <View style={styles.hintRow}>
          <Feather name="info" size={14} color={colors.bodyText} />
          <Text style={styles.hint}>
            Demandez à la personne : « Quel est le code SafeMatch ? »
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.confirmBtn} onPress={confirm} disabled={confirming || loading}>
            {confirming ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.confirmText}>Le code correspond, je monte</Text>
            )}
          </Pressable>
          <Pressable style={styles.mismatchBtn} onPress={reportMismatch}>
            <Text style={styles.mismatchText}>Le code ne correspond pas</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: {
    marginTop: 6,
    fontSize: 12,
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.bodyText,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 10,
    marginBottom: 28,
  },
  codeCard: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  codeColor: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  codeDigits: {
    color: '#ffffff',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  hint: {
    fontSize: 12,
    color: colors.bodyText,
    flexShrink: 1,
  },
  actions: {
    marginTop: 'auto',
    marginBottom: 24,
    alignSelf: 'stretch',
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: colors.statusGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  mismatchBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  mismatchText: {
    color: colors.sosRed,
    fontSize: 14,
    fontWeight: '600',
  },
});
