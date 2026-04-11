import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioListComponent } from './pages/portfolio-list/portfolio-list.component';
import { PortfolioAddComponent } from './pages/portfolio-add/portfolio-add.component';
import { PortfolioAnalysisComponent } from './pages/portfolio-analysis/portfolio-analysis.component';


@NgModule({
  declarations: [
    PortfolioListComponent,
    PortfolioAddComponent,
    PortfolioAnalysisComponent
  ],
  imports: [
    CommonModule,
    PortfolioRoutingModule
  ]
})
export class PortfolioModule { }
