import { Component, Input } from '@angular/core';
import { CenterAnnouncement } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-announcements',
  templateUrl: './center-announcements.component.html',
  styleUrls: ['./center-announcements.component.css']
})
export class CenterAnnouncementsComponent {
@Input() centerAnnouncements: CenterAnnouncement | undefined;
showAllAnnouncements: boolean = false;

constructor() {

}

allAnnouncements() {
  this.showAllAnnouncements = !this.showAllAnnouncements;
}
}
