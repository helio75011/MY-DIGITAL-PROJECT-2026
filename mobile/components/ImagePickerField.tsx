import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocalImage } from '../api/kyc';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  value: LocalImage | null;
  onChange: (image: LocalImage) => void;
  /** true pour ouvrir l'appareil photo (selfie), false pour la galerie. */
  camera?: boolean;
};

/**
 * Champ de sélection d'image pour le tunnel KYC : ouvre la galerie ou
 * l'appareil photo (selfie), affiche un aperçu une fois l'image choisie.
 */
export function ImagePickerField({ label, value, onChange, camera }: Props) {
  async function pick() {
    // Demande la permission adaptée (caméra pour le selfie, galerie sinon).
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', "L'accès à la caméra/galerie est nécessaire.");
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6, cameraType: ImagePicker.CameraType.front })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });

    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      onChange({ uri: a.uri, fileName: a.fileName, mimeType: a.mimeType });
    }
  }

  return (
    <Pressable style={styles.field} onPress={pick}>
      {value ? (
        <Image source={{ uri: value.uri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Feather name={camera ? 'camera' : 'upload'} size={26} color={colors.primary} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: colors.bodyText,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
});
