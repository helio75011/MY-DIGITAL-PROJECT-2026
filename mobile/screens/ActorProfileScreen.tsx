import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { MenuRow } from '../components/MenuRow';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const ROLE_LABEL: Record<string, string> = {
  GUARDIAN: 'Accompagnatrice',
  DRIVER: 'Chauffeur',
};

/** Profil de l'acteur (accompagnatrice / chauffeur). */
export function ActorProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Profil';
  const isDriver = user?.role === 'DRIVER';

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profil</Text>

        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.statCardBg} />
          </View>
          <View style={[styles.roleBadge, user?.isVerified ? styles.verified : styles.unverified]}>
            <Ionicons
              name={user?.isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.roleText}>
              {ROLE_LABEL[user?.role ?? ''] ?? 'Acteur'}
              {user?.isVerified ? ' · vérifié' : ' · non vérifié'}
            </Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
        </View>

        <Text style={styles.sectionTitle}>Mon activité</Text>
        <View style={styles.menuCard}>
          {isDriver ? (
            <MenuRow
              icon="truck"
              title="Mon véhicule"
              subtitle="Marque, modèle, plaque"
              divider
              onPress={() => navigation.navigate('ActorVehicle')}
            />
          ) : null}
          <MenuRow icon="help-circle" title="Aide & Support" />
        </View>

        <Pressable style={styles.logout} onPress={() => logout()}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 39, paddingTop: 4, paddingBottom: 24 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: colors.navy, letterSpacing: -0.75 },
  avatarBlock: { alignItems: 'center', marginTop: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.filterInactiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 30,
    marginTop: -10,
  },
  verified: { backgroundColor: colors.verifiedGreen },
  unverified: { backgroundColor: colors.driverRed },
  roleText: { color: '#ffffff', fontSize: 14, letterSpacing: -0.5 },
  name: { color: colors.navy, fontSize: 16, fontWeight: '800', marginTop: 12 },
  sectionTitle: {
    color: colors.sectionTitle,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 28,
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
  logoutText: { color: colors.heartRed, fontSize: 20, fontWeight: '500' },
});
