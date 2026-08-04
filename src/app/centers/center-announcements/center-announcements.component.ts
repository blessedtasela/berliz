import { Component, Input } from '@angular/core';
import { CenterAnnouncements } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-announcements',
  templateUrl: './center-announcements.component.html',
  styleUrls: ['./center-announcements.component.css']
})
export class CenterAnnouncementsComponent {
  @Input() centerAnnouncements: CenterAnnouncements[] = [];
  showAllAnnouncements: boolean = false;

  constructor() { }


  allAnnouncements() {
    this.showAllAnnouncements = !this.showAllAnnouncements;
  }
}
