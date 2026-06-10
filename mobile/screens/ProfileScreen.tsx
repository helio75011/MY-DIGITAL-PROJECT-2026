import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { MenuRow } from '../components/MenuRow';
import { colors } from '../theme/colors';

/**
 * Écran Profil (onglet "Profile", Figma 23:1902).
 * Avatar + badge vérifié, stats, sections "Sécurité & Protection" et
 * "Paramètres de l'application", déconnexion. Barre de nav fournie par les onglets.
 */
export function ProfileScreen() {
  return (
    <View style={styles.root}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre de page */}
        <View style={styles.titleRow}>
          <Pressable hitSlop={8}>
            <Feather name="chevron-left" size={26} color={colors.navy} />
          </Pressable>
          <Text style={styles.pageTitle}>Profil</Text>
        </View>

        {/* Avatar + badge vérifié */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.statCardBg} />
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.verifiedText}>Profil vérifié</Text>
          </View>
          <Text style={styles.name}>Lucie Berault</Text>
          <Text style={styles.member}>Membre depuis Mars 2026</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Trajets sécurisés</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="heart" size={26} color={colors.heartRed} />
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Score de confiance</Text>
          </View>
        </View>

        {/* Section Sécurité & Protection */}
        <Text style={styles.sectionTitle}>SÉCURITÉ & PROTECTION</Text>
        <View style={styles.menuCard}>
          <MenuRow icon="shield" title="Mes contacts" subtitle="3 actifs" divider />
          <MenuRow icon="file-text" title="Documents de vérifications" subtitle="Vérifié" divider />
          <MenuRow icon="clock" title="Historique des trajets" />
        </View>

        {/* Section Paramètres */}
        <Text style={styles.sectionTitle}>Paramètres de l'application</Text>
        <View style={styles.menuCard}>
          <MenuRow icon="user" title="Préférences de compte" divider />
          <MenuRow icon="bell" title="Notifications & Alertes" divider />
          <MenuRow icon="help-circle" title="Aide & Support" />
        </View>

        {/* Déconnexion */}
        <Pressable style={styles.logout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 39,
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
  avatarBlock: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.filterInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.verifiedGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 30,
    marginTop: -10,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: -0.75,
  },
  name: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 12,
  },
  member: {
    color: colors.bodyText,
    fontSize: 16,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    height: 100,
    backgroundColor: colors.statCardBg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 9,
    elevation: 5,
  },
  statValue: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: colors.sectionTitle,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: colors.menuCardBg,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  logout: {
    backgroundColor: colors.logoutBg,
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: colors.heartRed,
    fontSize: 20,
    fontWeight: '500',
  },
});
