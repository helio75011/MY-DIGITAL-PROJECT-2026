import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from './types';

/**
 * Navigue vers un onglet des MainTabs depuis un écran de la pile racine
 * (écrans de flux qui affichent la barre inférieure : Matching, Driver, Tracking).
 */
export function goToTab(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  tab: keyof MainTabParamList,
) {
  navigation.navigate('MainTabs', { screen: tab } as never);
}
