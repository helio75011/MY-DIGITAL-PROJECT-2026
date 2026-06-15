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
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

// Traduit les codes d'erreur de l'API en messages affichables.
function signupErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'email_taken') return 'Un compte existe déjà avec cet e-mail.';
    if (err.code === 'invalid_email') return 'Adresse e-mail invalide.';
    if (err.code === 'weak_password') return 'Le mot de passe doit faire au moins 8 caractères.';
    if (err.code === 'missing_fields') return 'Veuillez remplir tous les champs obligatoires.';
  }
  return 'Inscription impossible. Vérifiez votre réseau et réessayez.';
}

/**
 * Écran d'inscription Link & Walk.
 * Crée un compte passagère (POST /auth/register). Au succès, le gating de
 * navigation bascule automatiquement vers l'app. La vérification d'identité
 * complète (KYC) sera une étape ultérieure ; is_verified reste false ici.
 */
export function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    if (submitting) return;
    setError(null);

    // Validations côté client (l'API revalide de toute façon).
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      // Pas de navigation manuelle : RootNavigator réagit à `user`.
    } catch (err) {
      setError(signupErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* En-tête : logo + nom */}
          <View style={styles.header}>
            <Logo size={72} />
            <Text style={styles.logoText}>Link & walk</Text>
          </View>

          <Text style={styles.formTitle}>Créer un compte</Text>

          <TextInput
            style={styles.input}
            placeholder="Prénom"
            placeholderTextColor={colors.placeholder}
            value={firstName}
            onChangeText={setFirstName}
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor={colors.placeholder}
            value={lastName}
            onChangeText={setLastName}
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Téléphone (optionnel)"
            placeholderTextColor={colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (8 caractères min.)"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="center"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            placeholderTextColor={colors.placeholder}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="center"
            onSubmitEditing={handleSignup}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </Pressable>

          {/* Lien retour connexion */}
          <Pressable style={styles.loginLink} onPress={() => navigation.navigate('Welcome')}>
            <Text style={styles.loginSmall}>Déjà un compte ?</Text>
            <Text style={styles.loginBold}>Se connecter.</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.primary,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 22,
  },
  input: {
    width: 260,
    height: 37,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 12,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 37,
    marginTop: 6,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '500',
  },
  error: {
    color: colors.sosRed,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 260,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginSmall: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.text,
  },
  loginBold: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
