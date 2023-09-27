import { Component, ElementRef, Input } from '@angular/core';
import { CenterTrainers } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-trainers',
  templateUrl: './center-trainers.component.html',
  styleUrls: ['./center-trainers.component.css']
})
export class CenterTrainersComponent {
  @Input() centerTrainers: CenterTrainers | undefined;
  showAllTrainers: boolean = false;

  constructor(private elementRef: ElementRef){}

  scrollToComponent() {
    const targetElement = this.elementRef.nativeElement.querySelector('#targetComponent');
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }

  allTrainers(){
    this.showAllTrainers =! this.showAllTrainers;
  }
}
