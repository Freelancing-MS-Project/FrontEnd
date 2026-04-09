import { UserRole } from './user.model';

export interface AuthResponse {
  token: string;
  tokenType: 'Bearer';
  email: string;
  role: UserRole;
}
