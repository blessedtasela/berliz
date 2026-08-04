import { Component } from '@angular/core';

@Component({
  selector: 'app-legal-main',
  templateUrl: './legal-main.component.html',
  styleUrls: ['./legal-main.component.css']
})
export class LegalMainComponent {
  activeSection: 'terms' | 'guidelines' | null = null;

  open(section: 'terms' | 'guidelines') {
    this.activeSection = section;
  }
}
