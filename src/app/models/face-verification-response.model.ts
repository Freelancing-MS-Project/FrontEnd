export interface FaceVerificationResponse {
  match: boolean;
  confidence: number;
  error: string | null;
}
