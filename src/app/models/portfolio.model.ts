export interface PortfolioMedia {
  id: number;
  type: string;
  mediaUrl: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  media: PortfolioMedia[];
}

export interface PortfolioAnalysisDetails {
  projectScore: number;
  mediaScore: number;
  descriptionScore: number;
  repoScore: number;
  liveUrlScore: number;
}

export interface PortfolioAnalysis {
  freelancerId: number;
  projectCount: number;
  totalMediaCount: number;
  mediaCoveragePercentage: number;
  averageDescriptionLength: number;
  projectsWithRepoUrl: number;
  projectsWithLiveUrl: number;
  score: number;
  level: string;
  suggestions: string[];
  details: PortfolioAnalysisDetails;
}

export interface CreatePortfolioProjectRequest {
  title: string;
  description: string;
  projectUrl?: string;
  repoUrl?: string;
}