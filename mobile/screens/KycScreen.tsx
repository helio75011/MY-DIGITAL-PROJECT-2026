import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '../api/client';
import * as kyc from '../api/kyc';
import type { LocalImage } from '../api/kyc';
import { useAuth } from '../auth/AuthContext';
import { ImagePickerField } from '../components/ImagePickerField';
import { Logo } from '../components/Logo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const STEPS = ['Coordonnées', 'Vérification', 'Document', 'Selfie'] as const;

/**
 * Tunnel de vérification d'identité (KYC) en 4 étapes :
 *  1. Coordonnées (téléphone) -> envoi d'un code
 *  2. Saisie du code reçu
 *  3. Upload du document d'identité (recto/verso)
 *  4. Selfie -> validation -> is_verified = true
 *
 * Vérification simulée (pas d'OCR ni de reconnaissance faciale réelle) ; le code
 * est mocké côté API et renvoyé en mode dev pour faciliter la démo.
 */
export function KycScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Étape 1-2
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState('');

  // Étape 3-4
  const [front, setFront] = useState<LocalImage | null>(null);
  const [back, setBack] = useState<LocalImage | null>(null);
  const [selfie, setSelfie] = useState<LocalImage | null>(null);

  function msg(err: unknown, fallback: string): string {
    if (err instanceof ApiError) {
      const map: Record<string, string> = {
        invalid_code: 'Code incorrect.',
        code_expired: 'Code expiré, renvoyez-en un nouveau.',
        front_required: 'Le recto du document est requis.',
        selfie_required: 'Le selfie est requis.',
        selfie_missing: 'Ajoutez un selfie avant de valider.',
        document_missing: 'Ajoutez un document avant de valider.',
        invalid_file_type: 'Format de fichier non supporté (image attendue).',
        file_too_large: 'Fichier trop volumineux (8 Mo max).',
      };
      if (err.code && map[err.code]) return map[err.code];
    }
    return fallback;
  }

  async function run(fn: () => Promise<void>, fallback: string) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(msg(err, fallback));
    } finally {
      setBusy(false);
    }
  }

  // --- Actions par étape ---
  const handleSendCode = () =>
    run(async () => {
      const res = await kyc.sendCode(phone.trim() || undefined);
      setDevCode(res.devCode ?? null);
      setStep(1);
    }, "Envoi du code impossible.");

  const handleVerifyCode = () =>
    run(async () => {
      await kyc.verifyCode(code.trim());
      setStep(2);
    }, 'Vérification du code impossible.');

  const handleUploadDocument = () =>
    run(async () => {
      if (!front) {
        setError('Ajoutez au moins le recto du document.');
        return;
      }
      await kyc.uploadDocument(front, back ?? undefined);
      setStep(3);
    }, "Envoi du document impossible.");

  const handleFinish = () =>
    run(async () => {
      if (!selfie) {
        setError('Prenez un selfie pour terminer.');
        return;
      }
      await kyc.uploadSelfie(selfie);
      await kyc.completeKyc();
      await refreshUser(); // met à jour user.isVerified -> badge "vérifié"
      navigation.goBack();
    }, 'Validation impossible.');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* En-tête */}
          <View style={styles.topBar}>
            <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={26} color={colors.navy} />
            </Pressable>
            <Logo size={40} />
            <View style={{ width: 26 }} />
          </View>

          <Text style={styles.title}>Vérification d'identité</Text>

          {/* Indicateur d'étapes */}
          <View style={styles.steps}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= step ? styles.stepDotActive : null]}>
                  <Text style={[styles.stepNum, i <= step ? styles.stepNumActive : null]}>{i + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>{s}</Text>
              </View>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Contenu de l'étape */}
          {step === 0 && (
            <View style={styles.block}>
              <Text style={styles.help}>
                Confirmez votre numéro de téléphone. Un code de vérification vous sera envoyé.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor={colors.placeholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <PrimaryButton label="Envoyer le code" onPress={handleSendCode} busy={busy} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.block}>
              <Text style={styles.help}>Saisissez le code à 6 chiffres reçu.</Text>
              {devCode ? <Text style={styles.devHint}>Code de démo : {devCode}</Text> : null}
              <TextInput
                style={styles.input}
                placeholder="------"
                placeholderTextColor={colors.placeholder}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <PrimaryButton label="Valider le code" onPress={handleVerifyCode} busy={busy} />
              <Pressable onPress={handleSendCode}>
                <Text style={styles.linkText}>Renvoyer un code</Text>
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.block}>
              <Text style={styles.help}>
                Photographiez votre pièce d'identité (carte d'identité ou passeport).
              </Text>
              <ImagePickerField label="Recto du document" value={front} onChange={setFront} />
              <ImagePickerField label="Verso (optionnel)" value={back} onChange={setBack} />
              <PrimaryButton label="Continuer" onPress={handleUploadDocument} busy={busy} />
            </View>
          )}

          {step === 3 && (
            <View style={styles.block}>
              <Text style={styles.help}>
                Prenez un selfie pour confirmer que vous êtes bien la titulaire du document.
              </Text>
              <ImagePickerField label="Prendre un selfie" value={selfie} onChange={setSelfie} camera />
              <PrimaryButton label="Terminer la vérification" onPress={handleFinish} busy={busy} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress, busy }: { label: string; onPress: () => void; busy: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.buttonDisabled]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 20,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stepItem: { alignItems: 'center', flex: 1, gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.filterInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.bodyText },
  stepNumActive: { color: colors.primaryText },
  stepLabel: { fontSize: 9, color: colors.bodyText, textAlign: 'center' },
  block: { gap: 4 },
  help: { fontSize: 13, color: colors.bodyText, marginBottom: 16, lineHeight: 19 },
  devHint: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    marginBottom: 18,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontSize: 14, fontWeight: '600' },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },
  error: {
    color: colors.sosRed,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
});
