import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContratRoutingModule } from './contrat-routing.module';
import { ContratComponent } from './contrat.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ContratCreateComponent } from './contrat-create.component';
import { ContratListComponent } from './contrat-list.component';


@NgModule({
  declarations: [
    ContratComponent,
    ContratCreateComponent,
    ContratListComponent
  ],
  imports: [
    CommonModule,
    ContratRoutingModule,
    ReactiveFormsModule
  ]
})
export class ContratModule { }
