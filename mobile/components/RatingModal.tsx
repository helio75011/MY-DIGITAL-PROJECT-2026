import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { rateActor } from '../api/ratings';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  /** Identifiant de l'acteur à noter (null = données de démo, envoi désactivé). */
  ratedId: number | null;
  name: string;
  onClose: () => void;
  /** Appelé après une note envoyée avec succès (ou ignorée). */
  onDone?: () => void;
};

/**
 * Modale de notation post-trajet : 5 étoiles + commentaire optionnel.
 * Envoie la note via POST /ratings. Affichée à la clôture du trajet.
 */
export function RatingModal({ visible, ratedId, name, onClose, onDone }: Props) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStars(0);
    setComment('');
    setError(null);
  }

  async function submit() {
    if (stars < 1) {
      setError('Choisissez une note.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      if (ratedId) {
        await rateActor({ ratedId, rating: stars, comment: comment.trim() || undefined });
      }
      reset();
      onDone?.();
      onClose();
    } catch {
      setError("L'envoi a échoué. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  function skip() {
    reset();
    onDone?.();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={skip}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Trajet terminé !</Text>
          <Text style={styles.subtitle}>Comment s'est passé votre trajet avec {name} ?</Text>

          {/* Étoiles */}
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setStars(n)} hitSlop={6}>
                <FontAwesome
                  name={n <= stars ? 'star' : 'star-o'}
                  size={36}
                  color={n <= stars ? colors.starRose : colors.mutedText}
                  style={styles.star}
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Laisser un commentaire (optionnel)"
            placeholderTextColor={colors.placeholder}
            value={comment}
            onChangeText={setComment}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.submitBtn} onPress={submit} disabled={sending}>
            {sending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>Envoyer ma note</Text>
            )}
          </Pressable>
          <Pressable onPress={skip} hitSlop={8}>
            <Text style={styles.skip}>Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.bodyText,
    textAlign: 'center',
    marginBottom: 18,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  star: {
    marginHorizontal: 4,
  },
  input: {
    width: '100%',
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  error: {
    color: colors.sosRed,
    fontSize: 12,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  skip: {
    color: colors.bodyText,
    fontSize: 13,
  },
});
