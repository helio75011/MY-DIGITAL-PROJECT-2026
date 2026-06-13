import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'invalid_credentials') return 'E-mail ou mot de passe incorrect.';
    if (err.code === 'missing_fields') return 'Veuillez renseigner e-mail et mot de passe.';
  }
  return 'Connexion impossible. Vérifiez votre réseau et réessayez.';
}

/**
 * Écran d'accueil / connexion Link & Walk.
 * Fidèle à la maquette Figma (nœud 3:55). Le bouton effectue un vrai login :
 * au succès, le gating de navigation bascule automatiquement vers l'app.
 */
export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // Pas de navigation manuelle : RootNavigator réagit à `user`.
    } catch (err) {
      setError(loginErrorMessage(err));
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
        <View style={styles.container}>
          {/* En-tête : logo + nom */}
          <View style={styles.header}>
            <Logo size={84} />
            <Text style={styles.logoText}>Link & walk</Text>
          </View>

          <Text style={styles.welcome}>Bienvenue sur link & walk</Text>

          <Text style={styles.tagline}>
            Rentrer chez vous le soir en sécurité est notre priorité.{'\n'}
            Prenez le réflexe Link & Walk.
          </Text>

          {/* Formulaire de connexion */}
          <Text style={styles.formTitle}>Se connecter</Text>

          <TextInput
            style={styles.input}
            placeholder="Votre e-mail"
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
            placeholder="Mot de passe"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="center"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>

          {/* Lien d'inscription */}
          <Pressable style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupSmall}>Pas encore de compte ?</Text>
            <Text style={styles.signupBold}>Inscrivez-vous.</Text>
          </Pressable>
        </View>
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
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.primary,
  },
  welcome: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.text,
    marginBottom: 28,
  },
  tagline: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    width: 240,
    height: 37,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 12,
    color: colors.text,
    marginBottom: 22,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 37,
    marginTop: 2,
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
    marginBottom: 14,
    maxWidth: 240,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 28,
  },
  signupSmall: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.text,
  },
  signupBold: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
