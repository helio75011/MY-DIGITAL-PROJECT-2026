import * as SMS from 'expo-sms';
import { api } from './client';

export type EmergencyContact = {
  id: number;
  name: string;
  phone: string;
};

/**
 * Ouvre l'appli SMS pré-remplie vers les contacts d'urgence avec un message
 * (+ lien de position si coords fournies). Renvoie false si aucun contact ou
 * SMS indisponible. Utilisé par le SOS et le mode batterie faible.
 */
export async function sendEmergencySms(
  message: string,
  position?: { latitude: number; longitude: number }
): Promise<boolean> {
  const available = await SMS.isAvailableAsync();
  if (!available) return false;

  const contacts = await fetchContacts().catch(() => []);
  if (contacts.length === 0) return false;

  const locationLine = position
    ? `\nMa position : https://maps.google.com/?q=${position.latitude},${position.longitude}`
    : '';

  await SMS.sendSMSAsync(
    contacts.map((c) => c.phone),
    `${message}${locationLine}`
  );
  return true;
}

/** Liste les contacts d'urgence de l'utilisatrice connectée. */
export async function fetchContacts(): Promise<EmergencyContact[]> {
  return api.getJson('/contacts');
}

/** Ajoute un contact d'urgence. */
export async function addContact(name: string, phone: string): Promise<EmergencyContact> {
  return api.postJson('/contacts', { name, phone });
}

/** Supprime un contact d'urgence. */
export async function deleteContact(id: number): Promise<{ deleted: boolean }> {
  return api.del(`/contacts/${id}`);
}
