import { Component, OnInit } from '@angular/core';
import { Contrat } from '../../models/contrat';
import { ContratService } from '../../services/contrat.service';

@Component({
  selector: 'app-contrat-list',
  templateUrl: './contrat-list.component.html',
  styleUrl: './contrat-list.component.css'
})
export class ContratListComponent implements OnInit {
  contracts: Contrat[] = [];
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private readonly contratService: ContratService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;
    this.message = '';
    this.messageType = '';

    this.contratService.getAll().subscribe({
      next: (contracts) => {
        this.contracts = contracts;
        if (!contracts.length) {
          this.message = 'No contracts found.';
          this.messageType = 'success';
        }
      },
      error: () => {
        this.message = 'Unable to load contracts list.';
        this.messageType = 'error';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}