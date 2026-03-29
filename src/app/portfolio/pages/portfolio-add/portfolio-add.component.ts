import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-portfolio-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './portfolio-add.component.html',
  styleUrls: ['./portfolio-add.component.css']
})
export class PortfolioAddComponent {
  loading = false;
  error = '';

form: any;

constructor(
  private fb: FormBuilder,
  private portfolioService: PortfolioService,
  private router: Router
) {
  this.form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    projectUrl: [''],
    repoUrl: ['']
  });
}
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.portfolioService.addProject(this.form.value as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/portfolio']);
      },
      error: () => {
        this.error = 'Failed to create project.';
        this.loading = false;
      }
    });
  }
}