import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContratComponent } from './contrat.component';
import { ContratCreateComponent } from './contrat-create.component';
import { ContratListComponent } from './contrat-list.component';

const routes: Routes = [
  { path: '', component: ContratCreateComponent },
  { path: 'all', component: ContratListComponent },
  { path: 'create', component: ContratCreateComponent },
  { path: ':id', component: ContratComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratRoutingModule {}
