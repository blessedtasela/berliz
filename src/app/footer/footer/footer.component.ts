import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();
  constructor(private router: Router) {

  }

  goToSection(sectionId: string) {
    const element = document.querySelector(`#${sectionId}`);
    if (element) {
      this.router.navigate(['/trainers']);
      element.scrollIntoView({
        behavior: 'smooth'
      })
    }
  }
}
