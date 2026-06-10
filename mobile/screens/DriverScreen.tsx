import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { RouteCard } from '../components/RouteCard';
import { colors } from '../theme/colors';

const tripMap = require('../assets/trip-map.png');

/**
 * Écran "Chauffeur premium" (Figma 23:2360) — confirmation d'un trajet :
 * itinéraire, carte de suivi, profil chauffeur, infos véhicule/sécurité,
 * moyen de paiement et bouton de confirmation.
 */
export function DriverScreen() {
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre + itinéraire compact */}
        <View style={styles.topRow}>
          <View style={styles.titleCol}>
            <Pressable hitSlop={8}>
              <Feather name="chevron-left" size={26} color={colors.navy} />
            </Pressable>
            <Text style={styles.pageTitle}>Chauffeur premium</Text>
          </View>
          <View style={styles.routeCompact}>
            <RouteCard position="62 Rue de la Paix, Paris" destination="Gare du Nord, 75010" compact />
          </View>
        </View>

        {/* Carte map + ETA */}
        <ImageBackground source={tripMap} style={styles.map} imageStyle={styles.mapImage} resizeMode="cover">
          <View style={styles.etaPill}>
            <View style={styles.etaDot} />
            <Text style={styles.etaText}>Arrivée dans 2 min</Text>
            <Text style={styles.etaPrice}>15,00€</Text>
          </View>
        </ImageBackground>

        {/* Carte chauffeur */}
        <View style={styles.driverCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.driverCardBg} />
            </View>
            <View style={styles.availableDot}>
              <Feather name="check" size={9} color={colors.driverCardBg} />
            </View>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Mélanie Lepenant</Text>
            <Text style={styles.driverRole}>Chauffeur Certifié & Escorte</Text>
            <View style={styles.stars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <FontAwesome key={i} name="star" size={12} color={colors.starRose} />
              ))}
              <Text style={styles.ratingValue}>(4.9)</Text>
            </View>
          </View>
        </View>

        {/* Cartes Véhicule / Sécurité */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="car-outline" size={24} color="#ffffff" />
            <Text style={styles.infoTitle}>Véhicule</Text>
            <Text style={styles.infoMuted}>Berline Noire</Text>
            <Text style={styles.infoStrong}>AB-123-CD</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#ffffff" />
            <Text style={styles.infoTitle}>Sécurité</Text>
            <Text style={styles.infoMuted}>Véhicule suivit en temps réel</Text>
          </View>
        </View>

        {/* Paiement */}
        <View style={styles.paymentRow}>
          <View style={styles.payment}>
            <Feather name="credit-card" size={16} color={colors.bodyText} />
            <Text style={styles.paymentText}>Apple Pay •••• 4242</Text>
          </View>
          <Text style={styles.paymentPrice}>15,00€</Text>
        </View>

        {/* Confirmer */}
        <Pressable style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Confirmer le trajet</Text>
        </Pressable>
      </ScrollView>

      {/* Barre de navigation inférieure */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="ACCUEIL" />
        <NavItem icon="clock" label="HISTORIQUE" />
        <NavItem icon="user" label="PROFILE" />
        <NavItem icon="navigation" label="TRAJETS" active />
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
  },
  header: {
    height: 52,
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
  content: {
    paddingHorizontal: 27,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  routeCompact: {
    width: 181,
  },
  // Map
  map: {
    height: 197,
    marginTop: 20,
    justifyContent: 'flex-end',
    padding: 12,
  },
  mapImage: {
    borderRadius: 10,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,249,249,0.85)',
    borderRadius: 137,
    paddingHorizontal: 16,
    height: 40,
    gap: 12,
  },
  etaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },
  etaText: {
    flex: 1,
    color: colors.purple,
    fontSize: 16,
    fontWeight: '500',
  },
  etaPrice: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  // Carte chauffeur
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.driverCardBg,
    borderRadius: 10,
    padding: 22,
    marginTop: 15,
  },
  avatarWrap: {
    width: 72,
    height: 72,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableDot: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.availableDot,
    borderWidth: 1.8,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  driverName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  driverRole: {
    color: '#000000',
    fontSize: 14,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingValue: {
    color: colors.metaText,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  // Cartes info
  infoRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 15,
  },
  infoCard: {
    flex: 1,
    height: 105,
    backgroundColor: colors.infoCardBg,
    borderRadius: 10,
    padding: 16,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  infoMuted: {
    color: colors.infoCardMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  infoStrong: {
    color: '#c9c9c9',
    fontSize: 12,
    fontWeight: '700',
  },
  // Paiement
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    color: colors.bodyText,
    fontSize: 14,
    fontWeight: '500',
  },
  paymentPrice: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '700',
  },
  // Confirmer
  confirmBtn: {
    backgroundColor: colors.confirmBtnBg,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 25,
    marginTop: 18,
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 16,
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
    backgroundColor: colors.navProfileBg,
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
