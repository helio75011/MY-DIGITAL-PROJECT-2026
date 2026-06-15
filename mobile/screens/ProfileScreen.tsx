import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchStats, type UserStats } from '../api/stats';
import { useAuth } from '../auth/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { MenuRow } from '../components/MenuRow';
import { goToTab } from '../navigation/helpers';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

/**
 * Écran Profil (onglet "Profile", Figma 23:1902).
 * Avatar + badge vérifié, stats RÉELLES + badges (gamification), sections
 * "Sécurité & Protection" / "Paramètres", déconnexion.
 */
export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Profil';
  const verified = user?.isVerified ?? false;

  const [stats, setStats] = useState<UserStats | null>(null);
  useFocusEffect(
    useCallback(() => {
      fetchStats().then(setStats).catch(() => setStats(null));
    }, [])
  );

  return (
    <View style={styles.root}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre de page (onglet : pas de retour) */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Profil</Text>
        </View>

        {/* Avatar + badge vérifié */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.statCardBg} />
          </View>
          {verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.verifiedText}>Profil vérifié</Text>
            </View>
          ) : (
            <Pressable
              style={[styles.verifiedBadge, styles.unverifiedBadge]}
              onPress={() => navigation.navigate('Kyc')}
            >
              <Ionicons name="alert-circle" size={20} color="#ffffff" />
              <Text style={styles.verifiedText}>Profil non vérifié</Text>
            </Pressable>
          )}
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.member}>Membre depuis Mars 2026</Text>
        </View>

        {/* Incitation à compléter le KYC tant que le compte n'est pas vérifié */}
        {!verified ? (
          <Pressable style={styles.kycBanner} onPress={() => navigation.navigate('Kyc')}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
            <View style={styles.kycBannerText}>
              <Text style={styles.kycBannerTitle}>Vérifiez votre identité</Text>
              <Text style={styles.kycBannerSub}>Indispensable pour réserver un trajet en sécurité.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </Pressable>
        ) : null}

        {/* Stats (réelles) */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
            <Text style={styles.statValue}>{stats ? stats.completedTrips : '—'}</Text>
            <Text style={styles.statLabel}>Trajets sécurisés</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="heart" size={26} color={colors.heartRed} />
            <Text style={styles.statValue}>{stats ? stats.trustScore : '—'}</Text>
            <Text style={styles.statLabel}>Score de confiance</Text>
          </View>
        </View>

        {/* Badges (gamification) */}
        {stats && stats.badges.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>MES BADGES</Text>
            <View style={styles.badgesRow}>
              {stats.badges.map((b) => (
                <View key={b.code} style={[styles.badge, !b.unlocked && styles.badgeLocked]}>
                  <Ionicons
                    name={b.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={b.unlocked ? colors.primary : colors.mutedText}
                  />
                  <Text style={[styles.badgeLabel, !b.unlocked && styles.badgeLabelLocked]}>
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Section Sécurité & Protection */}
        <Text style={styles.sectionTitle}>SÉCURITÉ & PROTECTION</Text>
        <View style={styles.menuCard}>
          <MenuRow
            icon="shield"
            title="Mes contacts"
            subtitle="Contacts d'urgence"
            divider
            onPress={() => navigation.navigate('Contacts')}
          />
          <MenuRow
            icon="file-text"
            title="Documents de vérifications"
            subtitle={verified ? 'Vérifié' : 'À compléter'}
            divider
            onPress={() => navigation.navigate('Kyc')}
          />
          <MenuRow
            icon="clock"
            title="Historique des trajets"
            onPress={() => goToTab(navigation, 'Historique')}
          />
        </View>

        {/* Section Paramètres */}
        <Text style={styles.sectionTitle}>Paramètres de l'application</Text>
        <View style={styles.menuCard}>
          <MenuRow
            icon="help-circle"
            title="Aide & Support"
            subtitle="support@linkandwalk.fr"
            onPress={() =>
              Alert.alert('Aide & Support', 'Contactez-nous à support@linkandwalk.fr')
            }
          />
        </View>

        {/* Déconnexion */}
        <Pressable style={styles.logout} onPress={() => logout()}>
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
  unverifiedBadge: {
    backgroundColor: colors.driverRed,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.menuCardBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
  },
  kycBannerText: { flex: 1 },
  kycBannerTitle: { color: colors.navy, fontSize: 14, fontWeight: '700' },
  kycBannerSub: { color: colors.bodyText, fontSize: 12, marginTop: 2 },
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
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: 92,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.filterInactiveBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: colors.mutedText,
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
