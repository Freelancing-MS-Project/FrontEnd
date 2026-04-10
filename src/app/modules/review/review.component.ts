import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mission } from '../../models/mission';
import { MissionStatus } from '../../models/mission-status';
import { Review } from '../../models/review';
import { ReviewService } from '../../services/review.service';
import { MissionService } from '../../services/mission.service';

interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent implements OnInit {

  // ── Mission ──
  mission: Mission | null = null;
  missionLoading = true;
  missionError: string | null = null;
  missionId!: number;

  // Expose enum to template
  MissionStatus = MissionStatus;

  // ── Reviews ──
  reviews: Review[] = [];
  reviewsLoading = true;
  averageRating = 0;
  ratingDistribution: RatingDistribution[] = [];

  // ── Compose form ──
  selectedRating = 0;
  hoveredRating = 0;
  reviewComment = '';
  fromUser = 'publisherUser'; // replace with your auth service value
  toUser = '';                   // set from mission.clientId or resolved user
  submitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  // ── Edit mode ──
  editingReview: Review | null = null;
  editComment = '';
  editRating = 0;
  editHovered = 0;
  updateSuccess = false;
  updateError: string | null = null;

  // ── Delete confirm ──
  deletingId: number | null = null;
  deleteSuccess = false;
  deleteError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private missionService: MissionService
  ) {}

  ngOnInit(): void {
    this.missionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMission();
    this.loadReviews();
  }

  // ══════════════════════════════════════════
  //  LOAD
  // ══════════════════════════════════════════

  loadMission(): void {
    this.missionLoading = true;
    this.missionService.getMissionById(this.missionId).subscribe({
      next: (m) => {
        this.mission = m;
        this.toUser = String(m.clientId);
        this.missionLoading = false;
      },
      error: () => {
        this.missionError = 'Impossible de charger les détails de la mission.';
        this.missionLoading = false;
      }
    });
  }

  loadReviews(): void {
    this.reviewsLoading = true;
    this.reviewService.getReviewsByMissionId(this.missionId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews || [];
        this.computeStats();
        this.reviewsLoading = false;
        setTimeout(() => this.animateBars(), 300);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        this.reviews = [];
        this.reviewsLoading = false;
        this.submitError = 'Impossible de charger les avis. Veuillez réessayer plus tard.';
      }
    });
  }

  // ══════════════════════════════════════════
  //  STATS
  // ══════════════════════════════════════════

  private computeStats(): void {
    const total = this.reviews.length;
    if (total === 0) {
      this.averageRating = 0;
      this.ratingDistribution = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: 0, percentage: 0 }));
      return;
    }
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / total) * 10) / 10;

    this.ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
      const count = this.reviews.filter(r => r.rating === stars).length;
      return { stars, count, percentage: Math.round((count / total) * 100) };
    });
  }

  private animateBars(): void {
    document.querySelectorAll<HTMLElement>('.bar-fill').forEach(el => {
      const target = el.getAttribute('data-width') || '0%';
      el.style.width = target;
    });
  }

  // ══════════════════════════════════════════
  //  CREATE
  // ══════════════════════════════════════════

  submitReview(): void {
    if (!this.selectedRating || !this.reviewComment.trim()) return;
    this.submitting = true;
    this.submitError = null;

    const newReview: Review = {
      missionId: this.missionId,
      fromUser: this.fromUser,
      toUser: this.toUser,
      rating: this.selectedRating,
      comment: this.reviewComment.trim()
    };

    this.reviewService.createReview(newReview).subscribe({
      next: (created) => {
        this.reviews = [created, ...this.reviews];
        this.computeStats();
        this.selectedRating = 0;
        this.reviewComment = '';
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.submitSuccess = false, 3000);
        setTimeout(() => this.animateBars(), 100);
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.submitError = 'Erreur lors de la publication. Veuillez réessayer.';
        this.submitting = false;
        setTimeout(() => this.submitError = null, 3000);
      }
    });
  }

  // ══════════════════════════════════════════
  //  UPDATE
  // ══════════════════════════════════════════

  startEdit(review: Review): void {
    // Annuler toute édition en cours
    if (this.editingReview) {
      if (confirm('Vous avez une modification en cours. Voulez-vous l\'annuler ?')) {
        this.cancelEdit();
      } else {
        return;
      }
    }

    this.editingReview = { ...review };
    this.editComment = review.comment;
    this.editRating = review.rating;
    this.editHovered = 0;
    this.updateError = null;
  }

  cancelEdit(): void {
    this.editingReview = null;
    this.editComment = '';
    this.editRating = 0;
    this.updateError = null;
  }

  saveEdit(): void {
    if (!this.editingReview?.id || !this.editRating || !this.editComment.trim()) return;

    const updated: Review = {
      ...this.editingReview,
      rating: this.editRating,
      comment: this.editComment.trim()
    };

    this.reviewService.updateReview(this.editingReview.id, updated).subscribe({
      next: (saved) => {
        const idx = this.reviews.findIndex(r => r.id === saved.id);
        if (idx !== -1) this.reviews[idx] = saved;
        this.computeStats();
        this.cancelEdit();
        this.updateSuccess = true;
        setTimeout(() => this.updateSuccess = false, 3000);
        setTimeout(() => this.animateBars(), 100);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.updateError = 'Erreur lors de la modification de l\'avis. Veuillez réessayer.';
        setTimeout(() => this.updateError = null, 3000);
      }
    });
  }

  // ══════════════════════════════════════════
  //  DELETE
  // ══════════════════════════════════════════

  confirmDelete(id: number): void {
    this.deletingId = id;
    this.deleteError = null;
  }

  cancelDelete(): void {
    this.deletingId = null;
    this.deleteError = null;
  }

  deleteReview(id: number): void {
    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.computeStats();
        this.deletingId = null;
        this.deleteSuccess = true;
        setTimeout(() => this.deleteSuccess = false, 3000);
        setTimeout(() => this.animateBars(), 100);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.deleteError = 'Erreur lors de la suppression de l\'avis. Veuillez réessayer.';
        setTimeout(() => this.deleteError = null, 3000);
        this.deletingId = null;
      }
    });
  }

  // ══════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════

  getStarArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) return 'full';
      if (i < rating) return 'half';
      return 'empty';
    });
  }

  setRating(r: number): void { this.selectedRating = r; }
  setHover(r: number): void { this.hoveredRating = r; }
  clearHover(): void { this.hoveredRating = 0; }
  getDisplayRating(): number { return this.hoveredRating || this.selectedRating; }

  setEditRating(r: number): void { this.editRating = r; }
  setEditHover(r: number): void { this.editHovered = r; }
  clearEditHover(): void { this.editHovered = 0; }
  getEditDisplayRating(): number { return this.editHovered || this.editRating; }

  getDomainLabel(domain: string): string {
    const map: Record<string, string> = {
      WEB_DEVELOPMENT: 'Développement Web',
      MOBILE: 'Mobile',
      DATA_SCIENCE: 'Data Science',
      DEVOPS: 'DevOps',
      DESIGN: 'Design',
      OTHER: 'Autre'
    };
    return map[domain] || domain;
  }

  getStatusLabel(status: MissionStatus): string {
    const map: Record<MissionStatus, string> = {
      [MissionStatus.Open]:     'OUVERTE',
      [MissionStatus.Closed]:   'FERMÉE',
      [MissionStatus.Archived]: 'ARCHIVÉE'
    };
    return map[status] ?? status;
  }

  isOwnReview(review: Review): boolean {
    return review.fromUser === this.fromUser;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getInitials(user: string): string {
    return user.split(/[@.\s]/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
  }

  getAvatarColor(user: string): string {
    const colors = [
      'linear-gradient(135deg,#7b5ea7,#a07cc5)',
      'linear-gradient(135deg,#e07b4a,#e8a77a)',
      'linear-gradient(135deg,#2d9c85,#4abba3)',
      'linear-gradient(135deg,#c0392b,#e06b60)',
      'linear-gradient(135deg,#2980b9,#5dade2)',
      'linear-gradient(135deg,#8e44ad,#bb8fce)'
    ];
    let hash = 0;
    for (const c of user) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return colors[hash % colors.length];
  }

  isEdited(review: Review): boolean {
    return review.updatedAt !== review.createdAt && review.updatedAt != null;
  }
}
