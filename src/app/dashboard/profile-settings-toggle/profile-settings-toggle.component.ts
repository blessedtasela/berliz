import { Component } from '@angular/core';

/**
 * Shell for the merged "Profile" + "Settings" sidebar entry — same pattern
 * as TasksTodosToggleComponent. See dashboard-feature.module.ts for the
 * child route definitions ('view' / 'edit') this toggle links between.
 */
@Component({
  selector: 'app-profile-settings-toggle',
  templateUrl: './profile-settings-toggle.component.html',
  styleUrls: ['./profile-settings-toggle.component.css']
})
export class ProfileSettingsToggleComponent { }
