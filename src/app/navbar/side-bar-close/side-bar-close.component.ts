import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-side-bar-close',
  templateUrl: './side-bar-close.component.html',
  styleUrls: ['./side-bar-close.component.css']
})
export class SideBarCloseComponent implements OnDestroy {

  @Input() userData!: Users;
  @Input() notificationLength: number = 0;

  currentRoute: string | null = null;
  currentRouteName: string | null = null;
  responseMessage: string | null = null;

  private destroy$ = new Subject<void>();

  tooltipClass =
    "group-hover:opacity-100 transition-opacity duration-200 z-50 " +
    "group-hover:bg-white group-hover:font-bold group-hover:border " +
    "group-hover:border-gray-200 group-hover:rounded-md group-hover:shadow-md " +
    "group-hover:whitespace-nowrap group-hover:px-2 group-hover:py-1 " +
    "group-hover:text-xs group-hover:text-black";

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private snackbarService: SnackBarService
  ) {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  // -----------------------------
  // ROUTE HELPERS
  // -----------------------------

  isActive(route: string, exact: boolean = false): boolean {
    return exact
      ? this.currentRoute === route
      : this.currentRoute?.startsWith(route) ?? false;
  }

  isNotActive(): boolean {
    const paths = [
      '/dashboard/my-tasks',
      '/dashboard/my-notifications',
      '/dashboard/my-subscriptions',
      '/dashboard/my-faqs',
      '/dashboard/my-todos',
      '/dashboard/workspace',
      '/dashboard/profile',
      '/dashboard/settings'
    ];
    return paths.some(route => this.currentRoute?.startsWith(route));
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;
  }

  setRouterName(routeName: string) {
    this.currentRouteName = routeName;
  }

  clearRouterName(): void {
    this.currentRouteName = null;
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------

  logout() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };

    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);

    dialogRef.componentInstance.onEmitStatusChange
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        dialogRef.close();
        this.userService.logout();
        this.responseMessage = "You have successfully logged out";
        this.snackbarService.openSnackBar(this.responseMessage, '');
      });
  }

  // -----------------------------
  // CLEANUP
  // -----------------------------

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}