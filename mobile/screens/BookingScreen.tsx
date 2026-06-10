import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { ModeCard } from '../components/ModeCard';
import { RouteCard } from '../components/RouteCard';
import { colors } from '../theme/colors';

/**
 * Écran "Réserver un trajet" (Figma 23:2060).
 * Carte itinéraire (position → destination), choix du mode
 * (Accompagnement Solidaire / Chauffeur Premium), bottom nav (Trajets actif).
 */
export function BookingScreen() {
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
        {/* Titre */}
        <View style={styles.titleRow}>
          <Pressable hitSlop={8}>
            <Feather name="chevron-left" size={26} color={colors.navy} />
          </Pressable>
          <Text style={styles.pageTitle}>Réserver un trajet</Text>
        </View>

        {/* Carte itinéraire */}
        <View style={styles.routeWrap}>
          <RouteCard position="62 Rue de la Paix, Paris" destination="Gare du Nord, 75010" />
        </View>

        {/* Modes de trajet */}
        <Text style={styles.sectionTitle}>Choisir votre mode de trajet</Text>

        <View style={styles.modes}>
          <ModeCard
            variant="solidaire"
            title="Accompagnement Solidaire"
            description="Profils vérifiés, femme à femme. Idéal pour les trajets quotidiens."
            eta="21 min"
          />
          <ModeCard
            variant="premium"
            title="Chauffeur Premium"
            description="Agent certifié avec véhicule de veille. Protection maximale immédiate."
            eta="12 min"
            price="15,00€"
          />
        </View>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.75,
  },
  routeWrap: {
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 16,
  },
  modes: {
    gap: 20,
  },
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
