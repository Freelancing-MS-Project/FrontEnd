import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioAnalysis } from '../../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-analysis.component.html',
  styleUrls: ['./portfolio-analysis.component.css']
})
export class PortfolioAnalysisComponent implements OnInit {
  analysis: PortfolioAnalysis | null = null;
  loading = false;
  error = '';

  // temporary demo values
  freelancerId = 1;
  username = 'zied';

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadAnalysis();
  }

  loadAnalysis(): void {
    this.loading = true;
    this.error = '';

    this.portfolioService.getAnalysis(this.freelancerId, this.username).subscribe({
      next: (data) => {
        this.analysis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Portfolio analysis error:', err);
        this.error = 'Failed to load portfolio analysis.';
        this.loading = false;
      }
    });
  }
}