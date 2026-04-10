import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContratService } from '../../services/contrat.service';
import { Mission } from '../../models/mission';

@Component({
  selector: 'app-contrat-create',
  templateUrl: './contrat-create.component.html',
  styleUrl: './contrat-create.component.css'
})
export class ContratCreateComponent implements OnInit {
  createForm!: FormGroup;
  isSubmitting = false;
  isLoadingMissions = false;
  missions: Mission[] = [];
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly contratService: ContratService
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      missionId: [null, [Validators.required, Validators.min(1)]],
      clientId: ['', Validators.required],
      freelancerId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]]
    });

    this.loadMissions();
  }

  private loadMissions(): void {
    this.isLoadingMissions = true;
    this.contratService.getAllMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
      },
      error: () => {
        this.message = 'Unable to load missions. Please try again.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isLoadingMissions = false;
      }
    });
  }

  sendContract(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.message = '';
    this.messageType = '';

    const payload = {
      ...this.createForm.value,
      status: 'ACTIVE',
      signature: null
    };

    this.contratService.create(payload).subscribe({
      next: (created) => {
        this.message = `Contract sent successfully. Contract ID: ${created.id ?? 'N/A'}`;
        this.messageType = 'success';
        this.createForm.reset();
      },
      error: () => {
        this.message = 'Error while sending contract.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
