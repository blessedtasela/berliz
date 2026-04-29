import { Component, Input } from '@angular/core';

@Component({
  selector: 'hub-grid',
  templateUrl: './hub-grid.component.html',
  styleUrls: ['./hub-grid.component.css']
})
export class HubGridComponent {
  @Input() items!: Record<string, string | number>;

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
