import { Component, ElementRef, Input } from '@angular/core';
import { CenterCategory, Centers } from '../../models/centers.interface';
import { Categories } from 'src/app/models/categories.interface';

@Component({
  selector: 'app-center-list',
  templateUrl: './center-list.component.html',
  styleUrls: ['./center-list.component.css']
})
export class CenterListComponent {
  centers: Centers[] = [];
  @Input() centerCategory: CenterCategory[] = [];
  showAllCenters: boolean = false;

  constructor(
    private elementRef: ElementRef) {}
  scrollToComponent() {
    const targetElement = this.elementRef.nativeElement.querySelector('#targetComponent');
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }

  // format the trainer's name for the URL
  formatCenterName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  allCenters() {
    this.showAllCenters = !this.showAllCenters;
  }
}
