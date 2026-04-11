import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContratService } from '../../services/contrat.service';
import { Mission } from '../../models/mission';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-contrat-create',
  templateUrl: './contrat-create.component.html',
  styleUrl: './contrat-create.component.css'
})
export class ContratCreateComponent implements OnInit {
  createForm!: FormGroup;
  isSubmitting = false;
  isLoadingMissions = false;
  isLoadingClient = false;
  missions: Mission[] = [];
  clientDisplayName = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly contratService: ContratService,
    private readonly userService: UserService
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
    this.loadConnectedClient();
  }

  private loadConnectedClient(): void {
    this.isLoadingClient = true;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.clientDisplayName = `${user.firstName} ${user.lastName}`.trim();
        this.createForm.patchValue({ clientId: String(user.id) });
      },
      error: () => {
        this.clientDisplayName = '';
        this.createForm.patchValue({ clientId: '' });
        this.message = 'Unable to load current client information.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isLoadingClient = false;
      }
    });
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
        this.createForm.reset({
          missionId: null,
          clientId: this.createForm.get('clientId')?.value ?? '',
          freelancerId: '',
          startDate: '',
          endDate: '',
          amount: null
        });
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
