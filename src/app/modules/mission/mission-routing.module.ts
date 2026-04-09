import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MissionComponent} from './mission.component';
import { CreateMissionComponent } from './create-mission/create-mission.component';
import { UpdateMissionComponent } from './update-mission/update-mission.component';
import { AllMissionsComponent } from './all-missions/all-missions.component';

const routes: Routes = [
{path:'',component:MissionComponent},
{path:'createMission',component:CreateMissionComponent},
{path:'update/:id',component:UpdateMissionComponent},
{path:'allMissions',component:AllMissionsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionRoutingModule { }
