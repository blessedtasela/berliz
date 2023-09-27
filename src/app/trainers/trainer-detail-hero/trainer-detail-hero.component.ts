import { Component, Input, OnInit } from '@angular/core';
import { TrainerAlbum, TrainerHeroAlbum, TrainerStatistics } from 'src/app/models/trainers.interface';


@Component({
  selector: 'app-trainer-detail-hero',
  templateUrl: './trainer-detail-hero.component.html',
  styleUrls: ['./trainer-detail-hero.component.css']
})
export class TrainerDetailHeroComponent implements OnInit {
  @Input() stats: TrainerStatistics | undefined;
  @Input() album: TrainerHeroAlbum | undefined;
  albumIndex = 0;

  constructor() {

  }

  ngOnInit() {
    this.clientCounter();
    this.experienceCounter();
    this.heroCounter();
  }

  clientCounter() {
    const targetValue = this.stats?.clients;
    if (targetValue !== undefined && this.stats) {
      const interval = setInterval(() => {
        this.stats!.clientCounter++; // Increment the counterValue property
        if (this.stats!.clientCounter >= targetValue) {
          clearInterval(interval);
        }
      }, 8000 / targetValue);
    }
  }


  experienceCounter() {
    const targetValue = this.stats?.experience;
    if (targetValue !== undefined && this.stats) {
      const interval = setInterval(() => {
        this.stats!.experienceCounter++; // Increment the counterValue property
        if (this.stats!.experienceCounter >= targetValue) {
          clearInterval(interval);
        }
      }, 8000 / targetValue);
    }
  }

  heroCounter() {
    setInterval(() => {
      this.changeAlbum(1);
    }, 8000);
  }

  changeAlbum(n: number): void {
    if (this.album)
      this.albumIndex = (this.albumIndex + n + this.album?.photos?.length) % this.album?.photos?.length;
  }
}

