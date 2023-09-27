import { Component, Input } from '@angular/core';
import { TrainerCategory } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-category',
  templateUrl: './trainer-category.component.html',
  styleUrls: ['./trainer-category.component.css']
})
export class TrainerCategoryComponent {
  @Input() category: TrainerCategory | undefined;

  constructor(){ 
}

 // format the trainer's name for the URL
 formatCategoryName(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}
}
