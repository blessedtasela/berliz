import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-side-bar-open',
  templateUrl: './side-bar-open.component.html',
  styleUrls: ['./side-bar-open.component.css']
})
export class SideBarOpenComponent {
  currentRoute: any;
  responseMessage: any;
  @Input() userData!: Users;

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

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;;
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
