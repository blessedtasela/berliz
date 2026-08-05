import { Component, Input } from '@angular/core';
import { Centers } from 'src/app/models/centers.interface';

/**
 * "Centers offering this discipline" — DERIVED client-side from
 * `Center.categoryIds`. There is no per-category center endpoint.
 */
@Component({
  selector: 'app-category-centers',
  templateUrl: './category-centers.component.html',
  styleUrls: ['./category-centers.component.css']
})
export class CategoryCentersComponent {
  @Input() centers: Centers[] = [];
  @Input() categoryName = '';

  onImageError(event: any): void {
    event.target.src = 'assets/landing/hero-gym-centers.jpg';
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-') ?? '';
  }

  mapsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
  }
}
