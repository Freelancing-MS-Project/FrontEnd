import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import SignaturePad from 'signature_pad';
import { Contrat } from '../../models/contrat';
import { ContratService } from '../../services/contrat.service';

@Component({
  selector: 'app-contrat',
  templateUrl: './contrat.component.html',
  styleUrl: './contrat.component.css'
})
export class ContratComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas', { static: false })
  signatureCanvas!: ElementRef<HTMLCanvasElement>;

  contratForm!: FormGroup;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  isLoading = false;
  isSigning = false;

  private signaturePad!: SignaturePad;
  private resizeListener = () => this.resizeCanvas();

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly contratService: ContratService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(routeId) || routeId <= 0) {
      this.message = 'Invalid or missing contract id in route.';
      this.messageType = 'error';
      return;
    }

    this.loadContract(routeId);
  }

  ngAfterViewInit(): void {
    this.initSignaturePad();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  clearSignature(): void {
    if (!this.signaturePad) {
      return;
    }

    this.signaturePad.clear();
    this.contratForm.patchValue({ signature: '' });
    this.message = '';
    this.messageType = '';
  }

  signContract(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.message = 'Please provide your signature before signing.';
      this.messageType = 'error';
      return;
    }

    const contractId = Number(this.contratForm.getRawValue().id);
    if (!Number.isFinite(contractId) || contractId <= 0) {
      this.message = 'Invalid contract id.';
      this.messageType = 'error';
      return;
    }

    const signature = this.signaturePad.toDataURL('image/png').split(',')[1] ?? '';
    if (!signature) {
      this.message = 'Unable to read signature.';
      this.messageType = 'error';
      return;
    }

    this.contratForm.patchValue({ signature });

    this.isSigning = true;
    this.contratService.signContract(contractId, signature).subscribe({
      next: () => {
        this.message = 'Contract signed successfully.';
        this.messageType = 'success';
      },
      error: () => {
        this.message = 'Error while signing contract.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isSigning = false;
      }
    });
  }

  private initForm(): void {
    this.contratForm = this.fb.group({
      id: [null, Validators.required],
      missionId: [{ value: '', disabled: true }],
      clientId: [{ value: '', disabled: true }],
      freelancerId: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      signature: ['']
    });
  }

  private loadContract(id: number): void {
    this.isLoading = true;
    this.contratService.getById(id).subscribe({
      next: (contrat: Contrat) => {
        this.contratForm.patchValue({
          id: contrat.id,
          missionId: contrat.missionId,
          clientId: contrat.clientId,
          freelancerId: contrat.freelancerId,
          startDate: contrat.startDate,
          endDate: contrat.endDate,
          amount: contrat.amount
        });
      },
      error: () => {
        this.message = 'Unable to load contract details.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private initSignaturePad(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(17, 24, 39)',
      minWidth: 0.8,
      maxWidth: 2.2
    });

    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.signatureCanvas || !this.signaturePad) {
      return;
    }

    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const context = canvas.getContext('2d');
    if (context) {
      context.scale(ratio, ratio);
    }

    this.signaturePad.clear();
  }
}
