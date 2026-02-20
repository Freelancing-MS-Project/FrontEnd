import { Component, OnInit } from '@angular/core';
import { MissionService } from '../../services/mission.service';
import { Mission } from '../../models/mission';
import { MissionStatus } from '../../models/mission-status';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrl: './mission.component.css'
})
export class MissionComponent implements OnInit {
missions:Mission[]=[];
readonly MissionStatus = MissionStatus;
constructor(private missionService: MissionService,private router: Router) { }
ngOnInit(): void {
  this.missionService.getMissionsByClientId(1).subscribe({
    next: (missions) => {
      this.missions = missions;
    },
    error: (error) => {
      console.error('Error fetching missions:', error);
    }
  });
}

onDeleteMission(id: number) {
  Swal.fire({
    title: 'Delete mission?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#00a19e',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.missionService.deleteMission(id).subscribe({
        next: () => {
          this.missions = this.missions.filter(mission => mission.id !== id);
          Swal.fire({
            title: 'Deleted!',
            text: 'Mission has been deleted.',
            icon: 'success',
            confirmButtonColor: '#00a19e'
          });
        },
        error: (error) => {
          console.error('Error deleting mission:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete mission.',
            icon: 'error',
            confirmButtonColor: '#00a19e'
          });
        }
      });
    }
  });
}

//updae mission
onEdit(id: number) {
  // Navigate to the update mission page with the mission ID

  this.router.navigate(['/missions/update', id]);

}
}
