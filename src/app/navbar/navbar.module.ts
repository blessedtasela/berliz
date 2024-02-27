import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
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
import { SearchMyTodoComponent } from './search-my-todo/search-my-todo.component';
import { SearchTodoListComponent } from './search-todo-list/search-todo-list.component';
import { SearchMuscleGroupComponent } from './search-muscle-group/search-muscle-group.component';
import { SearchExerciseComponent } from './search-exercise/search-exercise.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SearchPaymentComponent } from './search-payment/search-payment.component';
import { SearchTaskComponent } from './search-task/search-task.component';
import { SearchSubTaskComponent } from './search-sub-task/search-sub-task.component';
import { SearchClientComponent } from './search-client/search-client.component';
import { SearchMemberComponent } from './search-member/search-member.component';
import { SearchTestimonialComponent } from './search-testimonial/search-testimonial.component';
import { SearchSubscriptionComponent } from './search-subscription/search-subscription.component';
import { SideBarOpenComponent } from './side-bar-open/side-bar-open.component';
import { SideBarCloseComponent } from './side-bar-close/side-bar-close.component';
import { NavbarBreadcrumbComponent } from './navbar-breadcrumb/navbar-breadcrumb.component';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { ImageCropperModule } from 'ngx-image-cropper';


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
    SearchTagComponent,
    SearchMyTodoComponent,
    SearchTodoListComponent,
    SearchMuscleGroupComponent,
    SearchExerciseComponent,
    TopBarComponent,
    SideBarComponent,
    SearchPaymentComponent,
    SearchTaskComponent,
    SearchSubTaskComponent,
    SearchClientComponent,
    SearchMemberComponent,
    SearchTestimonialComponent,
    SearchSubscriptionComponent,
    SideBarOpenComponent,
    SideBarCloseComponent,
    NavbarBreadcrumbComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
    RouterModule,
    FormsModule,
    BreadcrumbModule,
    MatIconModule,
    ImageCropperModule
  ],
  exports: [
    NavigationBarComponent,
    SidebarNavigationComponent,
    TopBarComponent,
    SideBarComponent,
    NavbarBreadcrumbComponent
  ],
  providers: [
  ]
})
export class NavbarModule { }
