export type UserRole = 'Client' | 'Freelancer' | 'Admin';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  cin: string;
  role: UserRole;
  userImageContentType: string | null;
  createdAt: string;
  updatedAt: string;
}
