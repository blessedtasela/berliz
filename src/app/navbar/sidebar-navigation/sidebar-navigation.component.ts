import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { UserDataService } from 'src/app/services/user-data.service';
import { ChangePasswordModalComponent } from 'src/app/dashboard/user/change-password-modal/change-password-modal.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { UpdateUserModalComponent } from 'src/app/dashboard/user/update-user-modal/update-user-modal.component';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.css']
})
export class SidebarNavigationComponent {
  @Output() isMenuOpen = new EventEmitter<boolean>();
  accountOpen: boolean = false;
  openMenu: boolean = false;
  isVisible: boolean = false;
  userData: any;
  visibilityClasses!: { 'opacity-0': boolean; 'opacity-100': boolean; };
  profileOpen: boolean = false;
  responseMessage: any;
  profilePhoto: any;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private userDataService: UserDataService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.setVisibilityClasses();
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.userDataService.getUser().subscribe(() => {
      this.userData = this.userDataService.userData;
      this.profilePhoto = this.userDataService.profilePhoto;
      this.ngxService.stop()
    });
  }
  toggleVisible(isVisible: boolean): void {
    console.log(`is the menu open: ${isVisible ? 'Yes' : 'No'}`)
    this.isVisible = isVisible;
    this.setVisibilityClasses();
  }

  private setVisibilityClasses(): void {
    this.visibilityClasses = {
      'opacity-0': !this.isVisible,
      'opacity-100': this.isVisible
    };
  }

  toggleAccount() {
    this.accountOpen = !this.accountOpen;
    this.isMenuOpen.emit(this.accountOpen);
    // console.log(`Account Menu status changed. Menu is now ${this.accountOpen ? 'Open' : 'Closed'}`)
  }

  openUpdateProfilePhoto() {
    const dialogRef = this.dialog.open(UpdateProfilePhotoModalComponent, {
      width: '400px',
      data: {
        image: this.profilePhoto
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateProfilePhotoModalComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onUpdateProfilePhoto.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig profile photo');
      }
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
  }

  isActive(path: string): boolean {
    return this.route.snapshot.routeConfig?.path === path;
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
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
  }

  openChangePassword() {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '400px', data: {
        image: this.profilePhoto
      }
    });
    const childComponentInstance = dialogRef.componentInstance as ChangePasswordModalComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onChangePassword.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig password');
      }
    });
  }

  openUpdateUser() {
    const dialogRef = this.dialog.open(UpdateUserModalComponent, {
      width: '700px',
      data: {
        userData: this.userData
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateUserModalComponent;

    // Set the event emitter before opening the dialog
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

}
