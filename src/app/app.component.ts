import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'freelancersPlateformeFront';

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authService.restoreSession().subscribe();
  }
}
