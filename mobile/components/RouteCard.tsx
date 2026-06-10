import { Feather, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  position: string;
  destination: string;
  /** Version réduite (carte d'en-tête de l'écran Chauffeur premium). */
  compact?: boolean;
};

/**
 * Carte itinéraire "MA POSITION → DESTINATION" partagée par les écrans
 * Réserver (23:2060), Trouver une accompagnatrice (23:2122) et
 * Chauffeur premium (23:2360, variante compacte).
 */
export function RouteCard({ position, destination, compact }: Props) {
  const iconSize = compact ? 18 : 24;
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.row}>
        <Feather name="crosshair" size={iconSize} color={colors.routeValue} />
        <View style={styles.texts}>
          <Text style={styles.label}>MA POSITION</Text>
          <Text style={[styles.value, compact && styles.valueCompact]} numberOfLines={1}>
            {position}
          </Text>
        </View>
      </View>

      <View style={[styles.connector, compact && styles.connectorCompact]} />

      <View style={styles.row}>
        <MaterialIcons name="location-pin" size={iconSize} color={colors.routeValue} />
        <View style={styles.texts}>
          <Text style={styles.label}>DESTINATION</Text>
          <Text style={[styles.value, compact && styles.valueCompact]} numberOfLines={1}>
            {destination}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.routeFieldBg,
    borderRadius: 10,
    padding: 22,
    gap: 8,
  },
  cardCompact: {
    padding: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  texts: {
    flex: 1,
  },
  label: {
    color: colors.routeLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.routeValue,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  valueCompact: {
    fontSize: 12,
  },
  connector: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginLeft: 11,
  },
  connectorCompact: {
    height: 12,
    marginLeft: 8,
  },
});
