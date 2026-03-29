import { Routes } from '@angular/router';
import { PortfolioListComponent } from './pages/portfolio-list/portfolio-list.component';
import { PortfolioAddComponent } from './pages/portfolio-add/portfolio-add.component';
import { PortfolioAnalysisComponent } from './pages/portfolio-analysis/portfolio-analysis.component';

export const PORTFOLIO_ROUTES: Routes = [
  { path: '', component: PortfolioListComponent },
  { path: 'add', component: PortfolioAddComponent },
  { path: 'analysis', component: PortfolioAnalysisComponent }
];