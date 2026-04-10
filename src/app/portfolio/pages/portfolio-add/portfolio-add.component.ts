import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
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
  form: FormGroup;

  private urlPattern =
    /^(https?:\/\/)(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/;

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(1000)
        ]
      ],
      projectUrl: [
        '',
        [
          Validators.pattern(this.urlPattern)
        ]
      ],
      repoUrl: [
        '',
        [
          Validators.pattern(this.urlPattern)
        ]
      ]
    });
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
  }

  get projectUrl() {
    return this.form.get('projectUrl');
  }

  get repoUrl() {
    return this.form.get('repoUrl');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = {
      title: this.title?.value?.trim(),
      description: this.description?.value?.trim(),
      projectUrl: this.projectUrl?.value?.trim() || null,
      repoUrl: this.repoUrl?.value?.trim() || null
    };

    this.portfolioService.addProject(payload).subscribe({
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