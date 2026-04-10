import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Mission } from '../../../models/mission';
import { MissionService } from '../../../services/mission.service';

@Component({
  selector: 'app-update-mission',
  templateUrl: './update-mission.component.html',
  styleUrls: ['./update-mission.component.css']
})
export class UpdateMissionComponent implements OnInit {
  missionForm!: FormGroup;
  mission!: Mission;
  today!: string;

  constructor(
    private missionService: MissionService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  futureDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  ngOnInit(): void {
    const today = new Date();
    this.today = today.toISOString().split('T')[0];

    this.missionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      budget: ['', [Validators.required, Validators.min(100)]],
      domain: ['', [Validators.required]],
      durationInWeeks: ['', [Validators.required, Validators.min(1), Validators.max(52)]],
      finishedAt: ['', [Validators.required, this.futureDateValidator.bind(this)]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!id) {
      this.router.navigate(['/missions']);
      return;
    }

    this.missionService.getMissionById(id).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.missionForm.patchValue({
          title: mission.title,
          description: mission.description,
          budget: mission.budget,
          domain: mission.domain,
          durationInWeeks: mission.durationInWeeks,
          finishedAt: mission.finishedAt ? this.toDateInputValue(mission.finishedAt) : ''
        });
      },
      error: (error) => {
        console.error('Error fetching mission:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load mission.',
          icon: 'error',
          confirmButtonColor: '#00a19e'
        });
        this.router.navigate(['/missions']);
      }
    });
  }

  onSubmit() {
    if (this.missionForm.invalid || !this.mission?.id) {
      this.missionForm.markAllAsTouched();
      return;
    }

    const formValue = this.missionForm.value;
    const updatedMission: Mission = {
      ...this.mission,
      ...formValue,
      finishedAt: new Date(formValue.finishedAt),
      updatedAt: new Date()
    };

    this.missionService.updateMission(this.mission.id, updatedMission).subscribe({
      next: () => {
        Swal.fire({
          title: 'Updated!',
          text: 'Mission updated successfully.',
          icon: 'success',
          confirmButtonColor: '#00a19e'
        });
        this.router.navigate(['/missions']);
      },
      error: (error) => {
        console.error('Error updating mission:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update mission.',
          icon: 'error',
          confirmButtonColor: '#00a19e'
        });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/missions']);
  }

  private toDateInputValue(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
