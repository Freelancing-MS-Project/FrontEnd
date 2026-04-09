export interface Review {
  id?: number;              
  missionId: number;
  fromUser: string;
  toUser: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}
