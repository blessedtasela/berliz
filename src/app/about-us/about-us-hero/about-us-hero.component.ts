import { Component } from '@angular/core';

interface Ember {
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
}

@Component({
  selector: 'app-about-us-hero',
  templateUrl: './about-us-hero.component.html',
  styleUrls: ['./about-us-hero.component.css']
})
export class AboutUsHeroComponent {
  // Deterministic-looking but varied scatter of embers, computed once per
  // render rather than sourced from a stock photo (the previous background
  // was an off-brand cyberpunk image with no relation to Berliz/fitness).
  readonly embers: Ember[] = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    duration: 4 + (i % 5) * 1.4,
    delay: (i % 7) * 0.8,
    size: 2 + (i % 4),
    opacity: 0.35 + (i % 4) * 0.15,
  }));
}
