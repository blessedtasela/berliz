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
    SearchSubscriptionComponent
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
