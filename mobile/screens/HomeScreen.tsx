import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { sendEmergencySms } from '../api/contacts';
import { getCurrentPosition } from '../api/location';
import { reportIncident } from '../api/tracking';
import { AppHeader } from '../components/AppHeader';
import { goToTab } from '../navigation/helpers';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

const mapBg = require('../assets/map-bg-2.png');

/**
 * Écran d'accueil SafeWalk (onglet "Accueil").
 * Fidèle à la maquette Figma (nœud 23:1226). La barre de navigation est
 * fournie par le Tab Navigator (custom tabBar), pas par l'écran.
 */
export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sosSending, setSosSending] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);

  // SOS depuis l'accueil (hors trajet) : confirmation biométrique, incident
  // serveur, SMS aux contacts avec la position. L'alerte n'est jamais bloquée.
  async function handleSos() {
    if (sosSending) return;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && enrolled) {
        const r = await LocalAuthentication.authenticateAsync({
          promptMessage: "Confirmez l'alerte SOS",
          cancelLabel: 'Annuler',
        });
        if (!r.success) return;
      }
    } catch {
      /* biométrie indisponible : on poursuit */
    }

    setSosSending(true);
    let position: { latitude: number; longitude: number } | undefined;
    try {
      const p = await getCurrentPosition();
      position = { latitude: p.latitude, longitude: p.longitude };
    } catch {
      /* position indisponible */
    }
    try {
      await reportIncident({ type: 'SOS', ...position });
    } catch {
      /* l'intention d'alerte prime */
    }
    try {
      await sendEmergencySms('🚨 ALERTE SafeWalk : je déclenche un SOS.', position);
    } catch {
      /* SMS indisponible */
    }
    setSosVisible(true);
    setSosSending(false);
  }

  return (
    <View style={styles.root}>
      <AppHeader />

      {/* Carte en fond (sous le header) */}
      <View style={styles.mapArea}>
        <ImageBackground source={mapBg} style={styles.map} resizeMode="cover">
          <View style={styles.content}>
            {/* Carte "Démarrer un trajet" */}
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>Démarrer un trajet</Text>
                <Feather name="navigation" size={20} color={colors.navy} />
              </View>
              <Text style={styles.tripSubtitle}>
                Effectuez un trajet avec une femme à proximité
              </Text>
              <Pressable style={styles.tripButton} onPress={() => goToTab(navigation, 'Trajets')}>
                <Text style={styles.tripButtonText}>LANCER LA RECHERCHE</Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </Pressable>
            </View>

            {/* Ligne : Mes contacts / Zone de sécurité */}
            <View style={styles.row}>
              <View style={styles.smallCard}>
                <View style={styles.smallCardHeader}>
                  <Text style={styles.smallCardTitle}>Mes contacts</Text>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.navy} />
                </View>
                <Text style={styles.smallCardSubtitle}>Contacts d'urgence</Text>
                <Pressable style={styles.addButton} onPress={() => navigation.navigate('Contacts')}>
                  <Feather name="plus" size={14} color="#ffffff" />
                  <Text style={styles.addButtonText}>GÉRER</Text>
                </Pressable>
              </View>

              <Pressable style={styles.smallCard} onPress={() => navigation.navigate('SafeZones')}>
                <View style={styles.smallCardHeader}>
                  <Text style={styles.smallCardTitle}>Zone de sécurité</Text>
                  <Ionicons name="map-outline" size={16} color={colors.green} />
                </View>
                <Text style={styles.smallCardSubtitle}>Voir les zones sûres</Text>
              </Pressable>
            </View>

            {/* Bouton SOS flottant (chevauche la ligne du dessus) */}
            <Pressable style={styles.sosButton} onPress={handleSos} disabled={sosSending}>
              {sosSending ? (
                <ActivityIndicator color={colors.sosRed} />
              ) : (
                <Text style={styles.sosText}>S.O.S</Text>
              )}
            </Pressable>

            {/* Bouton "Réservez votre chauffeur" */}
            <Pressable style={styles.driverButton} onPress={() => goToTab(navigation, 'Trajets')}>
              <Text style={styles.driverButtonText}>RÉSERVEZ VOTRE CHAUFFEUR</Text>
            </Pressable>
          </View>
        </ImageBackground>
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
              Votre position a été transmise à l'équipe de sécurité et à vos contacts d'urgence.
            </Text>
            <Pressable style={styles.modalBtn} onPress={() => setSosVisible(false)}>
              <Text style={styles.modalBtnText}>J'ai compris</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapArea: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 21,
    paddingTop: 45,
    gap: 16,
  },
  // Carte "Démarrer un trajet"
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
  },
  tripSubtitle: {
    fontSize: 14,
    color: colors.bodyText,
    lineHeight: 20,
  },
  tripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.navy,
    paddingHorizontal: 29,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  tripButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Ligne contacts / zone
  row: {
    flexDirection: 'row',
    gap: 21,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    minHeight: 113,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallCardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  smallCardSubtitle: {
    fontSize: 12,
    color: colors.bodyText,
    lineHeight: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 'auto',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  // SOS
  sosButton: {
    position: 'absolute',
    right: 7,
    top: 252,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sosBg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: colors.sosRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  sosText: {
    color: colors.sosRed,
    fontSize: 18,
    fontWeight: '600',
  },
  // Bouton chauffeur
  driverButton: {
    backgroundColor: colors.driverRed,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 35,
    alignSelf: 'center',
    marginTop: 8,
  },
  driverButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
