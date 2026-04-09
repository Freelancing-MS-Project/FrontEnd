import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(
  error: HttpErrorResponse,
  fallback = 'Une erreur inattendue est survenue.'
): string {
  const backendMessage = extractBackendMessage(error);

  switch (error.status) {
    case 0:
      return 'Le backend USER est inaccessible. Vérifiez que le service écoute bien sur http://localhost:8090.';
    case 400:
      return backendMessage || 'Requête invalide. Vérifiez les champs saisis.';
    case 401:
      return backendMessage || 'Authentification requise ou identifiants invalides.';
    case 403:
      return backendMessage || 'Accès interdit pour votre rôle actuel.';
    case 404:
      return backendMessage || 'Ressource introuvable.';
    case 409:
      return backendMessage || 'Conflit détecté. Cette ressource existe déjà.';
    case 502:
      return backendMessage || 'Le backend a répondu avec une erreur 502.';
    default:
      return backendMessage || fallback;
  }
}

function extractBackendMessage(error: HttpErrorResponse): string | null {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (error.error && typeof error.error === 'object') {
    const candidate = error.error.message || error.error.error;
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}
