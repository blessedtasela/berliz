import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMainComponent } from './user-main/user-main.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserProfileSettingsComponent } from './user-profile-settings/user-profile-settings.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserSecurityComponent } from './user-security/user-security.component';
import { UserProgressComponent } from './user-progress/user-progress.component';
import { UserProfileCardComponent } from './user-profile-card/user-profile-card.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserRouteComponent } from './user-route/user-route.component';
import { RouterModule } from '@angular/router';
import { UserProfilePhotoCropperComponent } from './user-profile-photo-cropper/user-profile-photo-cropper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IconsModule } from '../icons/icons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { UserProfileBannerComponent } from './user-profile-banner/user-profile-banner.component';
import { UserProfileIdentityComponent } from './user-profile-identity/user-profile-identity.component';
import { UserProfileStatsComponent } from './user-profile-stats/user-profile-stats.component';
import { UserBioEditComponent } from './user-bio-edit/user-bio-edit.component';
import { UserAccountInfoComponent } from './user-account-info/user-account-info.component';
import { UserProfileSettingsFormComponent } from './user-profile-settings-form/user-profile-settings-form.component';
import { UserProfileSettingsDangerzoneComponent } from './user-profile-settings-dangerzone/user-profile-settings-dangerzone.component';
import { ProgressSharingSettingsComponent } from './progress-sharing-settings/progress-sharing-settings.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { userFeatureKey, userReducer } from '../state/user/user.reducer';
import { StoreModule } from '@ngrx/store';


@NgModule({
  declarations: [
    UserMainComponent,
    UserProfileComponent,
    UserProfileSettingsComponent,
    UserSettingsComponent,
    UserSecurityComponent,
    UserProgressComponent,
    UserProfileCardComponent,
    UserAvatarComponent,
    UserInfoComponent,
    UserRouteComponent,
    UserProfilePhotoCropperComponent,
    UserProfileBannerComponent,
    UserProfileIdentityComponent,
    UserProfileStatsComponent,
    UserBioEditComponent,
    UserAccountInfoComponent,
    UserProfileSettingsFormComponent,
    UserProfileSettingsDangerzoneComponent,
    ProgressSharingSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ImageCropperModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    FeatherModule,
    NgSelectModule,
  ]
})
export class UserModule { }
