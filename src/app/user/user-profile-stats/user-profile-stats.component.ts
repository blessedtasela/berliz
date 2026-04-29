import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-profile-stats',
  templateUrl: './user-profile-stats.component.html',
  styleUrls: ['./user-profile-stats.component.css']
})
export class UserProfileStatsComponent {
 @Input() stats: any;
}
