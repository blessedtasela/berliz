import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-side-bar-close',
  templateUrl: './side-bar-close.component.html',
  styleUrls: ['./side-bar-close.component.css']
})
export class SideBarCloseComponent {
  currentRoute: any;
  responseMessage: any;
  @Input() userData!: Users;
  currentRouteName: string | null = null;
  @Input() notificationLength: number = 0;
  tooltipClasses = "group-hover:opacity-100 transition-opacity duration-200 z-50 group-hover:bg-white" +
    "group-hover:font-bold group-hover:border group-hover:border-gray-200 group-hover:rounded-md " +
    "group-hover:shadow-md group-hover:whitespace-nowrap group-hover:px-2 group-hover:py-1 " +
    "group-hover:text-xs group-hover:text-black";

  constructor(private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private snackbarService: SnackBarService) {
    this.currentRoute = this.router.url
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  isActive(route: string, exact: boolean = false): boolean {
    if (exact) {
      return this.currentRoute === route;
    }
    return this.currentRoute?.startsWith(route);
  }

  isNotActive(): boolean {
    const paths = ['/dashboard/my-tasks', '/dashboard/my-notifications', '/dashboard/my-subscriptions', '/dashboard/my-faqs',
      '/dashboard/my-todos', '/dashboard/workspace', '/dashboard/profile', '/dashboard/settings'];
    return paths.some(route => this.currentRoute?.startsWith(route));
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;;
  }

  setRouterName(routeName: string) {
    this.currentRouteName = routeName;
  }

  clearRouterName(): void {
    this.currentRouteName = null;
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
}
