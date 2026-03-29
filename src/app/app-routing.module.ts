import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

import { PortfolioListComponent } from './portfolio/pages/portfolio-list/portfolio-list.component';
import { PortfolioAddComponent } from './portfolio/pages/portfolio-add/portfolio-add.component';
import { PortfolioAnalysisComponent } from './portfolio/pages/portfolio-analysis/portfolio-analysis.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },


  { path: 'portfolio', component: PortfolioListComponent },
  { path: 'portfolio/add', component: PortfolioAddComponent },
  { path: 'portfolio/analysis', component: PortfolioAnalysisComponent },

  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}