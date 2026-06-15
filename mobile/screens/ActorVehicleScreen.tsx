import { Feather } from '@expo/vector-icons';
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
import { fetchVehicle, saveVehicle } from '../api/actor';
import { AppHeader } from '../components/AppHeader';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

/** Écran de gestion du véhicule de l'acteur (chauffeur). */
export function ActorVehicleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVehicle()
      .then((v) => {
        if (!v) return;
        setPlate(v.plate ?? '');
        setBrand(v.brand ?? '');
        setModel(v.model ?? '');
        setColor(v.color ?? '');
        setYear(v.year ? String(v.year) : '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!plate.trim()) {
      Alert.alert('Plaque requise', "Indiquez au moins la plaque d'immatriculation.");
      return;
    }
    setSaving(true);
    try {
      await saveVehicle({
        plate: plate.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        year: year ? Number(year) : undefined,
      });
      Alert.alert('Enregistré', 'Votre véhicule a été mis à jour.');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer le véhicule.");
    } finally {
      setSaving(false);
    }
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
            <Text style={styles.pageTitle}>Mon véhicule</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.navy} style={{ marginTop: 32 }} />
          ) : (
            <>
              <Field label="Plaque d'immatriculation" value={plate} onChange={setPlate} placeholder="AB-123-CD" />
              <Field label="Marque" value={brand} onChange={setBrand} placeholder="Peugeot" />
              <Field label="Modèle" value={model} onChange={setModel} placeholder="508" />
              <Field label="Couleur" value={color} onChange={setColor} placeholder="Noir" />
              <Field label="Année" value={year} onChange={setYear} placeholder="2022" keyboard="number-pad" />

              <Pressable style={styles.saveBtn} onPress={save} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveText}>Enregistrer</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: colors.bodyText, marginBottom: 6 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
