import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Trainers } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-list',
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.css']
})
export class TrainersListComponent {
  showAllTrainers: boolean = false;
  trainers: Trainers[] = [];
 
}