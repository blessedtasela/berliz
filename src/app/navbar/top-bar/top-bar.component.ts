import {
  Component,
  OnInit,
  HostListener,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';



import { UserService } from 'src/app/services/user.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Exercises } from 'src/app/models/exercise.interface';
import { Members } from 'src/app/models/members.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { Newsletter } from 'src/app/models/newsletter.model';
import { Partner } from 'src/app/models/partners.interface';
import { Payments } from 'src/app/models/payment.interface';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Tags } from 'src/app/models/tags.interface';
import { SubTasks, Tasks } from 'src/app/models/tasks.interface';
import { Testimonials } from 'src/app/models/testimonials.model';
import { TodoList } from 'src/app/models/todoList.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadUser } from 'src/app/state/user/user.actions';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']

})
export class TopBarComponent implements OnInit {
  openMenu = false;
  mdScreen = false;
  userData!: Users | null;
  profilePhoto: string | null = null;
  currentRoute: string | null = null;

  notificationLength = 0;
  notificationDropdown = false;
  isMobileSearchOpen = false;
  destroy$ = new Subject<void>();

  subscriptions: Subscription[] = [];

  @Input() isSearch = false;
  @Input() searchComponent = '';

  @Output() categoriesResults = new EventEmitter<Categories[]>();
  @Output() contactUsResults = new EventEmitter<ContactUs[]>();
  @Output() trainersResults = new EventEmitter<Trainers[]>();
  @Output() usersResults = new EventEmitter<Users[]>();
  @Output() partnersResults = new EventEmitter<Partner[]>();
  @Output() centersResult = new EventEmitter<Centers[]>();
  @Output() newslettersResult = new EventEmitter<Newsletter[]>();
  @Output() tagsResults = new EventEmitter<Tags[]>();
  @Output() myTodoResults = new EventEmitter<TodoList[]>();
  @Output() todoListResults = new EventEmitter<TodoList[]>();
  @Output() muscleGroupResults = new EventEmitter<MuscleGroups[]>();
  @Output() exerciseResults = new EventEmitter<Exercises[]>();
  @Output() clientsResult = new EventEmitter<Clients[]>();
  @Output() membersResult = new EventEmitter<Members[]>();
  @Output() paymentsResult = new EventEmitter<Payments[]>();
  @Output() subscriptionsResults = new EventEmitter<Subscriptions[]>();
  @Output() subTasksResult = new EventEmitter<SubTasks[]>();
  @Output() tasksResults = new EventEmitter<Tasks[]>();
  @Output() testimonialsResult = new EventEmitter<Testimonials[]>();

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,
    private authService: AuthService
  ) {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.onResize();
    this.subscribeToCloseSideBar();
    this.store.dispatch(loadUser());
    this.store.dispatch(loadMyNotifications());
    this.handleEmitEvent();
    this.registerNotificationTopics();
    this.watchUpdateProfilePhoto();
    this.watchUpdateUser();
    this.watchUpdateUserRole();
    this.watchUpdateUserStatus();
  }

  handleEmitEvent(): void {

    this.subscriptions.push(

      this.store.select(selectUser).subscribe(user => {
        this.userData = user;

        this.profilePhoto = user?.profilePhoto
          ? `data:image/jpeg;base64,${user.profilePhoto}`
          : null;
      }),

      this.store.select(selectMyNotifications).subscribe(notifications => {
        this.notificationLength =
          notifications?.filter(notification => !notification.read).length ?? 0;
      })

    );

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openMobileSearch() {
    this.isMobileSearchOpen = true;
  }

  closeMobileSearch() {
    this.isMobileSearchOpen = false;
  }

  toggleNotificationDropdown() {
    this.notificationDropdown = !this.notificationDropdown;
  }

  closeNotificationDropdown() {
    this.notificationDropdown = false;
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path) ?? false;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.openMenu = window.innerWidth >= 768;
  }

  get hasSearch(): boolean {
    return !!this.searchComponent;
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

  handleCategorySearchResults(results: Categories[]): void {
    this.categoriesResults.emit(results);
  }

  handleContactUsSearchResults(results: ContactUs[]): void {
    this.contactUsResults.emit(results);
    this.isSearch = true;
  }

  handleTrainerSearchResults(results: Trainers[]): void {
    this.trainersResults.emit(results);
  }

  handleUserSearchResults(results: Users[]): void {
    this.usersResults.emit(results);
  }

  handlePartnerSearchResults(results: Partner[]): void {
    this.partnersResults.emit(results);
  }

  handleCenterSearchResults(results: Centers[]): void {
    this.centersResult.emit(results);
  }

  handleNewsletterSearchResults(results: Newsletter[]): void {
    this.newslettersResult.emit(results);
  }

  handleTagSearchResults(results: Tags[]) {
    this.tagsResults.emit(results);
  }

  handleMyTodoSearchResults(results: TodoList[]) {
    this.myTodoResults.emit(results);
  }

  handleTodoListSearchResults(results: TodoList[]) {
    this.todoListResults.emit(results);
  }

  handleMuscleGroupSearchResults(results: MuscleGroups[]) {
    this.muscleGroupResults.emit(results);
  }

  handleExerciseSearchResults(results: Exercises[]) {
    this.exerciseResults.emit(results);
  }

  handlePaymentSearchResults(results: Payments[]) {
    this.paymentsResult.emit(results);
  }

  handleClientSearchResults(results: Clients[]) {
    this.clientsResult.emit(results);
  }

  handleMemberSearchResults(results: Members[]) {
    this.membersResult.emit(results);
  }

  handleSubscriptionSearchResults(results: Subscriptions[]) {
    this.subscriptionsResults.emit(results);
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

  private registerNotificationTopics() {
    const topics = [
      '/topic/getNotificationFromMap',
      '/topic/notification',
      '/topic/notificationBulkAction',
      '/topic/readNotification',
      '/topic/deleteNotification',
      '/topic/activateAccount',
      '/topic/deactivateAccount',
      '/topic/updateUserStatus',
      '/topic/updateUserRole',
      '/topic/updateUser'
    ];

    topics.forEach(topic => {
      this.rxStompService.watch(topic).subscribe(() => {
        this.handleEmitEvent();
      });
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}