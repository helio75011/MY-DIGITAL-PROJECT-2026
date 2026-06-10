import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { colors } from '../theme/colors';

const mapBg = require('../assets/map-bg-2.png');

/**
 * Écran d'accueil SafeWalk.
 * Fidèle à la maquette Figma (nœud 23:1226) :
 * header (logo + réglages), carte en fond, carte "Démarrer un trajet",
 * cartes "Mes contacts" / "Zone de sécurité", bouton SOS,
 * bouton "Réservez votre chauffeur", et barre de navigation inférieure.
 */
export function HomeScreen() {
  return (
    <View style={styles.root}>
      {/* Header blanc : logo + réglages */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerLogo}>
            <Logo size={40} />
            <Text style={styles.headerLogoText}>Link & walk</Text>
          </View>
          <Pressable hitSlop={8}>
            <Feather name="settings" size={22} color={colors.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Carte en fond (sous le header) */}
      <View style={styles.mapArea}>
        <ImageBackground source={mapBg} style={styles.map} resizeMode="cover">
          {/* Contenu superposé */}
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
              <Pressable style={styles.tripButton}>
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
                <Text style={styles.smallCardSubtitle}>4 contacts sur</Text>
                <Pressable style={styles.addButton}>
                  <Feather name="plus" size={14} color="#ffffff" />
                  <Text style={styles.addButtonText}>AJOUTER CONTACT</Text>
                </Pressable>
              </View>

              <View style={styles.smallCard}>
                <View style={styles.smallCardHeader}>
                  <Text style={styles.smallCardTitle}>Zone de sécurité</Text>
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.green} />
                </View>
                <Text style={styles.smallCardSubtitle}>Votre zone actuelle</Text>
              </View>
            </View>

            {/* Bouton SOS flottant (chevauche la ligne du dessus) */}
            <Pressable style={styles.sosButton}>
              <Text style={styles.sosText}>S.O.S</Text>
            </Pressable>

            {/* Bouton "Réservez votre chauffeur" */}
            <Pressable style={styles.driverButton}>
              <Text style={styles.driverButtonText}>RÉSERVEZ VOTRE CHAUFFEUR</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </View>

      {/* Barre de navigation inférieure */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="ACCUEIL" active />
        <NavItem icon="clock" label="HISTORIQUE" />
        <NavItem icon="user" label="PROFILE" />
        <NavItem icon="navigation" label="TRAJETS" />
      </View>
    </View>
  );
}

type NavItemProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  active?: boolean;
};

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <Pressable style={[styles.navItem, active && styles.navItemActive]}>
      <Feather name={icon} size={18} color={colors.navy} />
      <Text style={styles.navLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerSafe: {
    backgroundColor: '#ffffff',
    zIndex: 2,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoText: {
    fontSize: 11,
    color: colors.primary,
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
  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.barSurface,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 32,
  },
  navItemActive: {
    backgroundColor: colors.navActiveBg,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    marginTop: 4,
    color: colors.navy,
  },
});
