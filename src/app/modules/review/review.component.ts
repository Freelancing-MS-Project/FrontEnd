import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {

  ngOnInit(): void {
    // Déclenche l'animation des barres après un léger délai
    // pour que la transition CSS soit visible
    setTimeout(() => {
      const fills = document.querySelectorAll<HTMLElement>('.bar-fill');
      const widths = ['75%', '17%', '8%', '0%', '0%'];
      fills.forEach((el, i) => {
        el.style.width = widths[i];
      });
    }, 300);
  }
}
