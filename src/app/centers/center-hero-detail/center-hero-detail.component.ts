import { Component, Input } from '@angular/core';
import { CenterStatistics, CenterVideoAlbum } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-hero-detail',
  templateUrl: './center-hero-detail.component.html',
  styleUrls: ['./center-hero-detail.component.css']
})
export class CenterHeroDetailComponent {
  @Input() stats: CenterStatistics | undefined;
  @Input() album: CenterVideoAlbum | undefined;
  albumIndex = 0;
  
  constructor() {
  }

  ngOnInit() {
    this.membersCounter();
    this.ratingsCounter();
    this.experienceCounter();
    this.heroCounter();
  }

  membersCounter() {
    const targetValue = this.stats?.members;
    if (targetValue !== undefined && this.stats) {
      const interval = setInterval(() => {
        this.stats!.membersCounter++; // Increment the counterValue property
        if (this.stats!.membersCounter >= targetValue) {
          clearInterval(interval);
        }
      }, 8000 / targetValue);
    }
  }

  ratingsCounter() {
    const targetValue = this.stats?.ratings;
    if (targetValue !== undefined && this.stats) {
      const interval = setInterval(() => {
        this.stats!.ratingsCounter++; // Increment the counterValue property
        if (this.stats!.ratingsCounter >= targetValue) {
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
    }, 5000);
  }

  changeAlbum(n: number): void {
    if (this.album)
      this.albumIndex = (this.albumIndex + n + this.album?.videos?.length) % this.album?.videos?.length;
  }
}
