import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { IconsModule } from '../icons/icons.module';
import { RouterModule } from '@angular/router';
import { SidebarNavigationComponent } from './sidebar-navigation/sidebar-navigation.component';
import { SearchComponent } from './search/search.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchCategoryComponent } from './search-category/search-category.component';
import { FormsModule } from '@angular/forms';
import { SearchContactUsComponent } from './search-contact-us/search-contact-us.component';
import { SearchTrainerComponent } from './search-trainer/search-trainer.component';
import { SearchUserComponent } from './search-user/search-user.component';
import { SearchPartnerComponent } from './search-partner/search-partner.component';
import { SearchCenterComponent } from './search-center/search-center.component';
import { SearchNewsletterComponent } from './search-newsletter/search-newsletter.component';
import { SearchTagComponent } from './search-tag/search-tag.component';


@NgModule({
  declarations: [
    NavigationBarComponent,
    SidebarNavigationComponent,
    SearchComponent,
    ProfileComponent,
    SearchCategoryComponent,
    SearchContactUsComponent,
    SearchTrainerComponent,
    SearchUserComponent,
    SearchPartnerComponent,
    SearchCenterComponent,
    SearchNewsletterComponent,
    SearchTagComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    NavigationBarComponent,
    SidebarNavigationComponent
  ]
})
export class NavbarModule { }
