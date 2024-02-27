import { Component, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { Subscription } from 'rxjs';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  currentRoute: any;
  openMenu: boolean = false;
  mdScreen: boolean = false;
  userData!: any;
  responseMessage: any;
  profilePhoto: any;
  subscriptions: Subscription[] = []
  notificationLength: number = 0

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private snackbarService: SnackBarService,
    private notificationStateService: NotificationStateService,
    private rxStompService: RxStompService) {
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
    this.watchReadNotification()
    this.watchNotification()
    this.watchGetNotificationFromMap()
    this.watchNotificationBulkAction()
    this.watchDeleteNotification()
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.userStateService.getUser().subscribe((user) => {
        this.userData = user;
        this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto;
      }),
      this.notificationStateService.getMyNotifications().subscribe((notifications) => {
        if (notifications && notifications.length > 0) {
          this.notificationLength = notifications.filter(notification => !notification.read).length;
          console.log(this.notificationLength);
        } else {
          // Handle the case when there are no notifications
          this.notificationLength = 0;
          console.log('No notifications available.');
        }
      })
    );
  }


  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;;
  }

  isNotActive(): boolean {
    const paths = ['/dashboard/my-tasks', '/dashboard/my-notifications', '/dashboard/my-subscriptions', '/dashboard/my-faqs',
      '/dashboard/my-todos', '/dashboard/workspace', '/dashboard/profile', '/dashboard/settings'];
    return paths.some(route => this.currentRoute?.startsWith(route));
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.openMenu = window.innerWidth >= 768; // Change the breakpoint as needed
  }

  subscribeToCloseSideBar() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event) && window.innerWidth < 768) {
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

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  logout() {
    console.log('logging out')
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response: any) => {
      dialogRef.close();
      this.userService.logout();
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
  }

  watchGetNotificationFromMap() {
    this.rxStompService.watch('/topic/getNotificationFromMap').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchNotification() {
    this.rxStompService.watch('/topic/notification').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchNotificationBulkAction() {
    this.rxStompService.watch('/topic/notificationBulkAction').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchReadNotification() {
    this.rxStompService.watch('/topic/readNotification').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchDeleteNotification() {
    this.rxStompService.watch('/topic/deleteNotification').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedNewsletter: Notifications = JSON.parse(message.body);
      // this.notificationData = this.notificationData.filter(Notification => Notification.id !== receivedNewsletter.id);
      // this.totalNotifications = this.notificationData.length;
    });
  }

}

