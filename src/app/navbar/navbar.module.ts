import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { IconsModule } from '../icons/icons.module';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SideBarOpenComponent } from './side-bar-open/side-bar-open.component';
import { SideBarCloseComponent } from './side-bar-close/side-bar-close.component';
import { NavbarBreadcrumbComponent } from './navbar-breadcrumb/navbar-breadcrumb.component';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NotificationDropdownComponent } from './notification-dropdown/notification-dropdown.component';
import { GlobalSearchComponent } from './global-search/global-search.component';
import { MessagePopupComponent } from '../messages/message-popup/message-popup.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';
import { ChatThreadHeaderComponent } from '../messages/shared/chat-thread-header/chat-thread-header.component';
import { MessageBubbleComponent } from '../messages/shared/message-bubble/message-bubble.component';
import { ConversationRowComponent } from '../messages/shared/conversation-row/conversation-row.component';
import { MessageComposerComponent } from '../messages/shared/message-composer/message-composer.component';


@NgModule({
  declarations: [
    NavigationBarComponent,
    ProfileComponent,
    TopBarComponent,
    SideBarComponent,
    SideBarOpenComponent,
    SideBarCloseComponent,
    NavbarBreadcrumbComponent,
    NotificationDropdownComponent,
    GlobalSearchComponent,
    MessagePopupComponent,
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    IconsModule,
    RouterModule,
    FormsModule,
    BreadcrumbModule,
    MatIconModule,
    ImageCropperModule,
    ReactiveFormsModule,
    ChatThreadHeaderComponent,
    MessageBubbleComponent,
    ConversationRowComponent,
    MessageComposerComponent,
  ],
  exports: [
    NavigationBarComponent,
    TopBarComponent,
    SideBarComponent,
    NavbarBreadcrumbComponent,
    SideBarOpenComponent,
    SideBarCloseComponent,
    NotificationDropdownComponent,
    GlobalSearchComponent,
    MessagePopupComponent

  ],
  providers: [
  ]
})
export class NavbarModule { }
