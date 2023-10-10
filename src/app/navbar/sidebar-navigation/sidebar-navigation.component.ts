import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { Categories } from 'src/app/models/categories.interface';
import { UserStateService } from 'src/app/services/user-state.service';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';

@Component({
  selector: 'app-sidebar-navigation',
  templateUrl: './sidebar-navigation.component.html',
  styleUrls: ['./sidebar-navigation.component.css']
})
export class SidebarNavigationComponent {
  openMenu: boolean = false;
  userData: any;
  responseMessage: any;
  profilePhoto: any;
  @Output() categoriesResults: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  @Output() contactUsResults: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()
  @Output() trainersResults: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()
  @Output() usersResults: EventEmitter<Users[]> = new EventEmitter<Users[]>()
  @Input() searchComponent: string = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
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
  }

  handleTrainerSearchResults(results: Trainers[]): void {
    this.trainersResults.emit(results)
  }

  handleUserSearchResults(results: Users[]): void {
    this.usersResults.emit(results)
  }

  openUpdateProfilePhoto() {
    const dialogRef = this.dialog.open(UpdateProfilePhotoModalComponent, {
      width: '400px',
      data: {
        image: this.profilePhoto
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateProfilePhotoModalComponent;
    childComponentInstance.onUpdateProfilePhoto.subscribe(() => {
      this.ngxService.start()
      this.handleEmitEvent();
      this.ngxService.stop()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig profile photo');
      }
    });
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
}
