import { AuthResponse } from './auth-response.model';

export interface FaceLoginResponse extends AuthResponse {
  userId: number;
  confidence: number;
}
