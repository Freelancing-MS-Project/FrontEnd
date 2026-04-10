export interface Contrat {
  id?: number;
  missionId: number;
  clientId: string;
  freelancerId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status?: string;
  signature?: string | null;
}
