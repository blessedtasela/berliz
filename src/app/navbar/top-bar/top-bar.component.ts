import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Exercises } from 'src/app/models/exercise.interface';
import { Members } from 'src/app/models/members.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { Newsletter } from 'src/app/models/newsletter.model';
import { Partners } from 'src/app/models/partners.interface';
import { Payments } from 'src/app/models/payment.interface';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Tags } from 'src/app/models/tags.interface';
import { SubTasks, Tasks } from 'src/app/models/tasks.interface';
import { Testimonials } from 'src/app/models/testimonials.model';
import { TodoList } from 'src/app/models/todoList.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  openMenu: boolean = false;
  mdScreen: boolean = false;
  userData!: any;
  responseMessage: any;
  profilePhoto: any;
  currentRoute: any;
  @Input() isSearch: boolean = false;
  @Output() categoriesResults: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  @Output() contactUsResults: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()
  @Output() trainersResults: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()
  @Output() usersResults: EventEmitter<Users[]> = new EventEmitter<Users[]>()
  @Output() partnersResults: EventEmitter<Partners[]> = new EventEmitter<Partners[]>()
  @Output() centersResult: EventEmitter<Centers[]> = new EventEmitter<Centers[]>()
  @Output() newslettersResult: EventEmitter<Newsletter[]> = new EventEmitter<Newsletter[]>();
  @Output() tagsResults: EventEmitter<Tags[]> = new EventEmitter<Tags[]>();
  @Output() myTodoResults: EventEmitter<TodoList[]> = new EventEmitter<TodoList[]>();
  @Output() todoListResults: EventEmitter<TodoList[]> = new EventEmitter<TodoList[]>();
  @Output() muscleGroupResults: EventEmitter<MuscleGroups[]> = new EventEmitter<MuscleGroups[]>();
  @Output() exerciseResults: EventEmitter<Exercises[]> = new EventEmitter<Exercises[]>();
  @Output() clientsResult: EventEmitter<Clients[]> = new EventEmitter<Clients[]>()
  @Output() membersResult: EventEmitter<Members[]> = new EventEmitter<Members[]>()
  @Output() paymentsResult: EventEmitter<Payments[]> = new EventEmitter<Payments[]>()
  @Output() subscriptionsResults: EventEmitter<Subscriptions[]> = new EventEmitter<Subscriptions[]>()
  @Output() subTasksResult: EventEmitter<SubTasks[]> = new EventEmitter<SubTasks[]>()
  @Output() tasksResults: EventEmitter<Tasks[]> = new EventEmitter<Tasks[]>();
  @Output() testimonialsResult: EventEmitter<Testimonials[]> = new EventEmitter<Testimonials[]>();
  @Input() searchComponent: string = ''

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) {
    this.currentRoute = this.router.url
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.onResize();
    this.subscribeToCloseSideBar()
    this.handleEmitEvent();
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.openMenu = window.innerWidth >= 768; // Change the breakpoint as needed
  }

  subscribeToCloseSideBar() {
    document.addEventListener('mousedown', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('sidebarView');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.openMenu = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
      this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto;
    });
  }

  handleCategorySearchResults(results: Categories[]): void {
    this.categoriesResults.emit(results)
  }

  handleContactUsSearchResults(results: ContactUs[]): void {
    this.contactUsResults.emit(results)
    this.isSearch = true;
  }

  handleTrainerSearchResults(results: Trainers[]): void {
    this.trainersResults.emit(results)
  }

  handleUserSearchResults(results: Users[]): void {
    this.usersResults.emit(results)
  }

  handlePartnerSearchResults(results: Partners[]): void {
    this.partnersResults.emit(results)
  }

  handleCenterSearchResults(results: Centers[]): void {
    this.centersResult.emit(results)
  }

  handleNewsletterSearchResults(results: Newsletter[]): void {
    this.newslettersResult.emit(results)
  }

  handleTagSearchResults(results: Tags[]) {
    this.tagsResults.emit(results)
  }

  handleMyTodoSearchResults(results: TodoList[]) {
    this.myTodoResults.emit(results)
  }

  handleTodoListSearchResults(results: TodoList[]) {
    this.todoListResults.emit(results)
  }

  handleMuscleGroupSearchResults(results: MuscleGroups[]) {
    this.muscleGroupResults.emit(results);
  }

  handleExerciseSearchResults(results: Exercises[]) {
    this.exerciseResults.emit(results);
  }

  handlePaymentSearchResults(results: Payments[]) {
    this.paymentsResult.emit(results)
  }

  handleClientSearchResults(results: Clients[]) {
    this.clientsResult.emit(results);
  }

  handleMemberSearchResults(results: Members[]) {
    this.membersResult.emit(results);
  }

  handleSubscriptionSearchResults(results: Subscriptions[]) {
    this.subscriptionsResults.emit(results)
  }

  handlesubTaskSearchResults(results: SubTasks[]) {
    this.subTasksResult.emit(results);
  }

  handleTaskSearchResults(results: Tasks[]) {
    this.tasksResults.emit(results);
  }

  handleTestimonialSearchResults(results: Testimonials[]) {
    this.testimonialsResult.emit(results);
  }

}
