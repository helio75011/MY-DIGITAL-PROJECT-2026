import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { colors } from '../theme/colors';

/**
 * Écran de vérification biométrique (empreinte digitale).
 * Fidèle à la maquette Figma (nœud 23:1146).
 */
export function BiometricScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* En-tête : logo + nom */}
        <View style={styles.header}>
          <Logo size={84} />
          <Text style={styles.logoText}>Link & walk</Text>
        </View>

        <Text style={styles.welcome}>Bienvenue sur link & walk</Text>

        <Text style={styles.almost}>Vous y êtes presque !</Text>

        <Text style={styles.sectionTitle}>Vérification biométrique</Text>

        <Text style={styles.instructions}>
          Veuillez placer le doigt enregistré lors de votre inscription sur
          l'empreinte digitale afin de vous connecter.
        </Text>

        {/* Empreinte digitale */}
        <Pressable style={styles.fingerprint}>
          <Ionicons name="finger-print-outline" size={87} color={colors.text} />
        </Pressable>

        {/* Bouton de connexion */}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => {
            // TODO: déclencher l'authentification biométrique
          }}
        >
          <Text style={styles.buttonText}>Me connecter</Text>
        </Pressable>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
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
    marginBottom: 36,
  },
  almost: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    width: 283,
    marginBottom: 40,
  },
  fingerprint: {
    marginBottom: 44,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 37,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '500',
  },
});
