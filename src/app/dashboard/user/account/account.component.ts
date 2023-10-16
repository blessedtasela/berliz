import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateProfilePhotoModalComponent } from '../update-profile-photo-modal/update-profile-photo-modal.component';
import { UpdateUserModalComponent } from '../update-user-modal/update-user-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
  user!: Users;
  responseMessage: any;
  subscription = new Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) { }


  ngOnInit(): void {
    this.userStateService.userData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.user = cachedData;
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
  handleEmitEvent() {
    this.ngxService.start();
    this.subscription.add(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
    );
    this.ngxService.stop()
  }

  openUpdateUser() {
    const dialogRef = this.dialog.open(UpdateUserModalComponent, {
      width: '700px',
      data: {
        userData: this.user
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateUserModalComponent;
    childComponentInstance.onUpdateUser.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig account');
      }
    });
  }

  deactivateAccount() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'deactivate your acount. You won\'t be able to login anymore.' +
        'To activate your account back, please contact berlizworld@gmail.com with your username and request.',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.userService.deactivateAccount()
        .subscribe((response: any) => {
          localStorage.removeItem('token')
          this.ngxService.start()
          this.responseMessage = response;
          this.ngxService.stop();
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.router.navigate(['/home'])
        }, (error) => {
          this.ngxService.stop();
          console.log(error)
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

}
