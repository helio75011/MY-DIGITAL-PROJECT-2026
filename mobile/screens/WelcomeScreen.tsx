import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

/**
 * Écran d'accueil / connexion Link & Walk.
 * Fidèle à la maquette Figma (nœud 3:55).
 */
export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

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
            placeholder="Votre nom"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
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
          />

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('Biometric')}
          >
            <Text style={styles.buttonText}>Suivant</Text>
          </Pressable>

          {/* Lien d'inscription */}
          <Pressable style={styles.signupLink}>
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
  buttonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '500',
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
