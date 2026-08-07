import { Component, Input } from '@angular/core';

@Component({
  selector: 'hub-card',
  templateUrl: './hub-card.component.html',
  styleUrls: ['./hub-card.component.css']
})
export class HubCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() link!: string;
  /** Feather icon shown in the card badge — set by the hub section the card belongs to. */
  @Input() icon: string = 'layers';

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
