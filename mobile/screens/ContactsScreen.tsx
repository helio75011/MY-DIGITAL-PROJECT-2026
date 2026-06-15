import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addContact, deleteContact, fetchContacts, type EmergencyContact } from '../api/contacts';
import { AppHeader } from '../components/AppHeader';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

/**
 * Gestion des contacts d'urgence : liste, ajout, suppression.
 * Ces contacts sont prévenus par SMS lors d'une alerte SOS.
 */
export function ContactsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      setContacts(await fetchContacts());
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Champs requis', 'Indiquez un nom et un numéro.');
      return;
    }
    setAdding(true);
    try {
      const created = await addContact(name.trim(), phone.trim());
      setContacts((prev) => [...prev, created]);
      setName('');
      setPhone('');
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter le contact.");
    } finally {
      setAdding(false);
    }
  }

  function remove(c: EmergencyContact) {
    Alert.alert('Supprimer', `Retirer ${c.name} de vos contacts d'urgence ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContact(c.id);
            setContacts((prev) => prev.filter((x) => x.id !== c.id));
          } catch {
            Alert.alert('Erreur', 'Suppression impossible.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <AppHeader />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
              <Feather name="chevron-left" size={26} color={colors.navy} />
            </Pressable>
            <Text style={styles.pageTitle}>Contacts d'urgence</Text>
          </View>
          <Text style={styles.subtitle}>
            En cas d'alerte SOS, ces proches reçoivent votre position par SMS.
          </Text>

          {/* Liste */}
          {loading ? (
            <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
          ) : contacts.length === 0 ? (
            <Text style={styles.empty}>Aucun contact pour l'instant.</Text>
          ) : (
            <View style={styles.list}>
              {contacts.map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{c.name}</Text>
                    <Text style={styles.phone}>{c.phone}</Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => remove(c)}>
                    <Feather name="trash-2" size={20} color={colors.sosRed} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Ajout */}
          <Text style={styles.formTitle}>Ajouter un contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            placeholderTextColor={colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Pressable style={styles.addBtn} onPress={add} disabled={adding}>
            {adding ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.addText}>Ajouter le contact</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.bodyText, marginTop: 8, marginBottom: 20, lineHeight: 19 },
  empty: { fontSize: 14, color: colors.bodyText, fontStyle: 'italic', marginTop: 16 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.menuCardBg,
    borderRadius: 10,
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  phone: { color: colors.onDarkMuted, fontSize: 13, marginTop: 2 },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 28,
    marginBottom: 14,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
    marginBottom: 14,
  },
  addBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
