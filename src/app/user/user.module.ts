import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserProfileSettingsComponent } from './user-profile-settings/user-profile-settings.component';
import { UserProgressComponent } from './user-progress/user-progress.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { UserRouteComponent } from './user-route/user-route.component';
import { RouterModule } from '@angular/router';
import { UserProfilePhotoCropperComponent } from './user-profile-photo-cropper/user-profile-photo-cropper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IconsModule } from '../icons/icons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { SharedModule } from '../shared/shared.module';
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


import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
@NgModule({
  declarations: [
    UserProfileComponent,
    UserProfileSettingsComponent,
    UserProgressComponent,
    UserAvatarComponent,
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
    LoadErrorComponent,
    CommonModule,
    RouterModule,
    ImageCropperModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    FeatherModule,
    NgSelectModule,
    SharedModule,
  ]
})
export class UserModule { }
