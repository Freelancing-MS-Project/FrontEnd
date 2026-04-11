import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MissionRoutingModule } from './mission-routing.module';
import { MissionComponent } from './mission.component';
import { CreateMissionComponent } from './create-mission/create-mission.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { UpdateMissionComponent } from './update-mission/update-mission.component';
import { AllMissionsComponent } from './all-missions/all-missions.component';

@NgModule({
  declarations: [
    MissionComponent,
    CreateMissionComponent,
    UpdateMissionComponent,
    AllMissionsComponent
  ],
  imports: [
    CommonModule,
    MissionRoutingModule,
    ReactiveFormsModule,
    FormsModule,
   HttpClientModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MissionModule { }
