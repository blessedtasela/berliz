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

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
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
