import { api } from './client';

export type KycStatus = {
  isVerified: boolean;
  hasSelfie: boolean;
  hasDocument: boolean;
  hasPhone: boolean;
};

// Image sélectionnée (expo-image-picker) à téléverser.
export type LocalImage = { uri: string; fileName?: string | null; mimeType?: string | null };

// Construit la part fichier attendue par FormData en React Native.
function filePart(image: LocalImage, fallbackName: string) {
  return {
    uri: image.uri,
    name: image.fileName || fallbackName,
    type: image.mimeType || 'image/jpeg',
  } as unknown as Blob;
}

/** Étape 1 : enregistre le téléphone et envoie un code de vérification. */
export async function sendCode(phone?: string): Promise<{ sent: boolean; devCode?: string }> {
  return api.postJson('/kyc/send-code', phone ? { phone } : {});
}

/** Étape 2 : valide le code reçu. */
export async function verifyCode(code: string): Promise<{ verified: boolean }> {
  return api.postJson('/kyc/verify-code', { code });
}

/** Étape 3 : téléverse le document d'identité (recto requis, verso optionnel). */
export async function uploadDocument(
  front: LocalImage,
  back?: LocalImage,
  docType = 'id_card'
): Promise<{ docCode: string }> {
  const form = new FormData();
  form.append('docType', docType);
  form.append('front', filePart(front, 'front.jpg'));
  if (back) form.append('back', filePart(back, 'back.jpg'));
  return api.postForm('/kyc/documents', form);
}

/** Étape 4 : téléverse le selfie de vérification faciale. */
export async function uploadSelfie(selfie: LocalImage): Promise<{ selfieUrl: string }> {
  const form = new FormData();
  form.append('selfie', filePart(selfie, 'selfie.jpg'));
  return api.postForm('/kyc/selfie', form);
}

/** Clôt le tunnel : passe le compte en vérifié si document + selfie présents. */
export async function completeKyc(): Promise<{ verified: boolean }> {
  return api.postJson('/kyc/complete', {});
}

/** État d'avancement du KYC (réhydratation du tunnel). */
export async function fetchKycStatus(): Promise<KycStatus> {
  return api.getJson('/kyc/status');
}
