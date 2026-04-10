import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioProject } from '../../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.css']
})
export class PortfolioListComponent implements OnInit {
  projects: PortfolioProject[] = [];
  loading = false;
  error = '';
  selectedProject: PortfolioProject | null = null;

  backendBaseUrl = 'http://localhost:8081';

  selectedFile: File | null = null;
  uploading = false;
  uploadError = '';
  uploadSuccess = '';

  isEditModalOpen = false;
  updatingProject = false;
  deletingProject = false;
  projectActionError = '';
  projectActionSuccess = '';

  editProjectData = {
    title: '',
    description: '',
    projectUrl: '',
    repoUrl: ''
  };

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';

    this.portfolioService.getProjects().subscribe({
      next: (data) => {
        this.projects = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading portfolio projects:', err);
        this.error = 'Failed to load portfolio projects.';
        this.loading = false;
      }
    });
  }

  openProjectModal(project: PortfolioProject): void {
    this.selectedProject = {
      ...project,
      media: project.media || []
    };
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.projectActionError = '';
    this.projectActionSuccess = '';
    this.isEditModalOpen = false;
    document.body.style.overflow = 'hidden';
  }

  closeProjectModal(): void {
    this.selectedProject = null;
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.projectActionError = '';
    this.projectActionSuccess = '';
    this.isEditModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  getMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) {
      return '';
    }

    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }

    return `${this.backendBaseUrl}${mediaUrl}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
      this.uploadSuccess = '';
    }
  }

  uploadMedia(): void {
    if (!this.selectedProject) {
      this.uploadError = 'No project selected.';
      return;
    }

    if (!this.selectedFile) {
      this.uploadError = 'Please choose an image first.';
      return;
    }

    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';

    this.portfolioService
      .uploadProjectMedia(this.selectedProject.id, this.selectedFile, 'IMAGE')
      .subscribe({
        next: (newMedia) => {
          if (!this.selectedProject) {
            this.uploading = false;
            return;
          }

          if (!this.selectedProject.media) {
            this.selectedProject.media = [];
          }

          this.selectedProject.media = [...this.selectedProject.media, newMedia];

          this.projects = this.projects.map((project) =>
            project.id === this.selectedProject!.id
              ? { ...project, media: [...(project.media || []), newMedia] }
              : project
          );

          this.uploadSuccess = 'Image uploaded successfully.';
          this.selectedFile = null;
          this.uploading = false;
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.uploadError = 'Failed to upload image.';
          this.uploading = false;
        }
      });
  }

  deleteMedia(mediaId: number): void {
    if (!this.selectedProject) return;

    if (!confirm('Delete this image?')) return;

    this.portfolioService.deleteMedia(mediaId).subscribe({
      next: () => {
        if (!this.selectedProject) return;

        this.selectedProject.media = (this.selectedProject.media || []).filter(
          m => m.id !== mediaId
        );

        this.projects = this.projects.map(project =>
          project.id === this.selectedProject!.id
            ? {
                ...project,
                media: (project.media || []).filter(m => m.id !== mediaId)
              }
            : project
        );
      },
      error: (err) => {
        console.error(err);
        alert('Failed to delete image');
      }
    });
  }

  openEditProjectModal(): void {
    if (!this.selectedProject) return;

    this.editProjectData = {
      title: this.selectedProject.title || '',
      description: this.selectedProject.description || '',
      projectUrl: this.selectedProject.projectUrl || '',
      repoUrl: this.selectedProject.repoUrl || ''
    };

    this.projectActionError = '';
    this.projectActionSuccess = '';
    this.isEditModalOpen = true;
  }

  closeEditProjectModal(): void {
    this.isEditModalOpen = false;
    this.projectActionError = '';
  }

  saveProjectUpdates(): void {
    if (!this.selectedProject) return;

    if (!this.editProjectData.title.trim()) {
      this.projectActionError = 'Project title is required.';
      return;
    }

    if (!this.editProjectData.description.trim()) {
      this.projectActionError = 'Project description is required.';
      return;
    }

    this.updatingProject = true;
    this.projectActionError = '';
    this.projectActionSuccess = '';

    const payload = {
      title: this.editProjectData.title.trim(),
      description: this.editProjectData.description.trim(),
      projectUrl: this.editProjectData.projectUrl.trim(),
      repoUrl: this.editProjectData.repoUrl.trim()
    };

    this.portfolioService.updateProject(this.selectedProject.id, payload).subscribe({
      next: (updatedProject) => {
        const mergedProject: PortfolioProject = {
          ...this.selectedProject!,
          ...updatedProject,
          media: updatedProject.media || this.selectedProject!.media || []
        };

        this.selectedProject = mergedProject;

        this.projects = this.projects.map(project =>
          project.id === mergedProject.id ? mergedProject : project
        );

        this.projectActionSuccess = 'Project updated successfully.';
        this.updatingProject = false;
        this.isEditModalOpen = false;
      },
      error: (err) => {
        console.error('Failed to update project:', err);
        this.projectActionError = 'Failed to update project.';
        this.updatingProject = false;
      }
    });
  }

  deleteProject(): void {
    if (!this.selectedProject) return;

    const confirmed = confirm(`Delete project "${this.selectedProject.title}"?`);
    if (!confirmed) return;

    this.deletingProject = true;
    this.projectActionError = '';
    this.projectActionSuccess = '';

    const projectId = this.selectedProject.id;

    this.portfolioService.deleteProject(projectId).subscribe({
      next: () => {
        this.projects = this.projects.filter(project => project.id !== projectId);
        this.deletingProject = false;
        this.closeProjectModal();
      },
      error: (err) => {
        console.error('Failed to delete project:', err);
        this.projectActionError = 'Failed to delete project.';
        this.deletingProject = false;
      }
    });
  }
}